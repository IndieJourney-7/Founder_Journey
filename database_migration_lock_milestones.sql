-- =====================================================
-- LOCK MILESTONE SYSTEM MIGRATION
-- Replaces steps/lessons with commitment-based milestones
-- =====================================================

-- 1. Create lock_milestones table
CREATE TABLE IF NOT EXISTS lock_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Milestone target
    target_value NUMERIC NOT NULL,          -- e.g., 100, 250, 500, 1000
    title TEXT NOT NULL,                     -- e.g., "First $100", "Halfway!"

    -- Commitment (the "lock")
    commitment TEXT,                         -- e.g., "No Netflix until I hit this"

    -- Reward (when unlocked)
    reward TEXT,                             -- e.g., "Treat myself to a nice dinner"

    -- Visual
    icon_emoji TEXT DEFAULT '🎯',
    theme_color TEXT DEFAULT '#E7C778',

    -- Status
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    unlocked_value NUMERIC,                  -- Actual value when unlocked

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create daily_checkins table for promise tracking
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES lock_milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Check-in data
    checkin_date DATE NOT NULL,
    kept_promise BOOLEAN NOT NULL,           -- true = kept, false = broke
    note TEXT,                               -- Optional note for the day

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint: one check-in per milestone per day
    UNIQUE(milestone_id, checkin_date)
);

-- 3. Create milestone_watchers table (for public accountability)
CREATE TABLE IF NOT EXISTS milestone_watchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES lock_milestones(id) ON DELETE CASCADE,
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,

    -- Watcher info (can be anonymous or named)
    watcher_name TEXT,
    watcher_email TEXT,                      -- For notifications

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(milestone_id, watcher_email)
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lock_milestones_mountain ON lock_milestones(mountain_id);
CREATE INDEX IF NOT EXISTS idx_lock_milestones_user ON lock_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_lock_milestones_unlocked ON lock_milestones(mountain_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_milestone ON daily_checkins(milestone_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(milestone_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_milestone_watchers_milestone ON milestone_watchers(milestone_id);

-- 5. Enable RLS
ALTER TABLE lock_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_watchers ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for lock_milestones

-- Users can view their own milestones
DROP POLICY IF EXISTS "Users can view own milestones" ON lock_milestones;
CREATE POLICY "Users can view own milestones"
ON lock_milestones FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own milestones
DROP POLICY IF EXISTS "Users can insert own milestones" ON lock_milestones;
CREATE POLICY "Users can insert own milestones"
ON lock_milestones FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestones
DROP POLICY IF EXISTS "Users can update own milestones" ON lock_milestones;
CREATE POLICY "Users can update own milestones"
ON lock_milestones FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own milestones
DROP POLICY IF EXISTS "Users can delete own milestones" ON lock_milestones;
CREATE POLICY "Users can delete own milestones"
ON lock_milestones FOR DELETE
USING (auth.uid() = user_id);

-- Public can view milestones for public mountains
DROP POLICY IF EXISTS "Public can view milestones for public mountains" ON lock_milestones;
CREATE POLICY "Public can view milestones for public mountains"
ON lock_milestones FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = lock_milestones.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- 7. RLS Policies for daily_checkins

-- Users can manage their own check-ins
DROP POLICY IF EXISTS "Users can manage own checkins" ON daily_checkins;
CREATE POLICY "Users can manage own checkins"
ON daily_checkins FOR ALL
USING (auth.uid() = user_id);

-- Public can view check-ins for public mountains
DROP POLICY IF EXISTS "Public can view checkins for public mountains" ON daily_checkins;
CREATE POLICY "Public can view checkins for public mountains"
ON daily_checkins FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM lock_milestones lm
        JOIN mountains m ON m.id = lm.mountain_id
        WHERE lm.id = daily_checkins.milestone_id
        AND m.is_public = TRUE
    )
);

-- 8. RLS Policies for milestone_watchers

-- Anyone can watch a public milestone
DROP POLICY IF EXISTS "Anyone can watch public milestones" ON milestone_watchers;
CREATE POLICY "Anyone can watch public milestones"
ON milestone_watchers FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestone_watchers.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- Mountain owners can view their watchers
DROP POLICY IF EXISTS "Owners can view milestone watchers" ON milestone_watchers;
CREATE POLICY "Owners can view milestone watchers"
ON milestone_watchers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestone_watchers.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- 9. Function to auto-unlock milestones when progress changes
CREATE OR REPLACE FUNCTION check_lock_milestone_unlocks()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if current_value has changed
    IF NEW.current_value IS DISTINCT FROM OLD.current_value THEN
        -- Unlock all milestones where target_value <= current_value
        UPDATE lock_milestones
        SET
            is_unlocked = TRUE,
            unlocked_at = NOW(),
            unlocked_value = NEW.current_value,
            updated_at = NOW()
        WHERE mountain_id = NEW.id
        AND is_unlocked = FALSE
        AND target_value <= NEW.current_value;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for auto-unlocking
DROP TRIGGER IF EXISTS trigger_check_lock_milestone_unlocks ON mountains;
CREATE TRIGGER trigger_check_lock_milestone_unlocks
    AFTER UPDATE ON mountains
    FOR EACH ROW
    EXECUTE FUNCTION check_lock_milestone_unlocks();

-- 11. Function to calculate streak for a milestone
CREATE OR REPLACE FUNCTION get_milestone_streak(milestone_uuid UUID)
RETURNS TABLE (
    current_streak INTEGER,
    longest_streak INTEGER,
    total_days INTEGER,
    kept_days INTEGER,
    commitment_rate NUMERIC
) AS $$
DECLARE
    streak INTEGER := 0;
    max_streak INTEGER := 0;
    prev_date DATE := NULL;
    rec RECORD;
BEGIN
    -- Calculate streaks
    FOR rec IN
        SELECT checkin_date, kept_promise
        FROM daily_checkins
        WHERE milestone_id = milestone_uuid
        ORDER BY checkin_date DESC
    LOOP
        IF rec.kept_promise THEN
            IF prev_date IS NULL OR prev_date - rec.checkin_date = 1 THEN
                streak := streak + 1;
            ELSE
                IF streak > max_streak THEN max_streak := streak; END IF;
                streak := 1;
            END IF;
        ELSE
            IF streak > max_streak THEN max_streak := streak; END IF;
            streak := 0;
        END IF;
        prev_date := rec.checkin_date;
    END LOOP;

    IF streak > max_streak THEN max_streak := streak; END IF;

    RETURN QUERY
    SELECT
        streak as current_streak,
        max_streak as longest_streak,
        COUNT(*)::INTEGER as total_days,
        COUNT(*) FILTER (WHERE kept_promise)::INTEGER as kept_days,
        CASE
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE kept_promise)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
            ELSE 0
        END as commitment_rate
    FROM daily_checkins
    WHERE milestone_id = milestone_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. View for milestone progress with stats
CREATE OR REPLACE VIEW milestone_progress_view AS
SELECT
    lm.id,
    lm.mountain_id,
    lm.user_id,
    lm.target_value,
    lm.title,
    lm.commitment,
    lm.reward,
    lm.icon_emoji,
    lm.is_unlocked,
    lm.unlocked_at,
    lm.sort_order,
    m.current_value,
    m.target_value as journey_target,
    m.metric_prefix,
    m.metric_suffix,
    CASE
        WHEN m.target_value > 0 THEN ROUND((m.current_value / m.target_value) * 100, 1)
        ELSE 0
    END as journey_progress,
    (SELECT COUNT(*) FROM daily_checkins dc WHERE dc.milestone_id = lm.id) as total_checkins,
    (SELECT COUNT(*) FROM daily_checkins dc WHERE dc.milestone_id = lm.id AND dc.kept_promise = TRUE) as kept_checkins,
    (SELECT COUNT(*) FROM milestone_watchers mw WHERE mw.milestone_id = lm.id) as watcher_count
FROM lock_milestones lm
JOIN mountains m ON m.id = lm.mountain_id;

-- =====================================================
-- MIGRATION COMPLETE
--
-- New tables:
-- - lock_milestones: Commitment-based milestone tracking
-- - daily_checkins: Promise tracking calendar
-- - milestone_watchers: Public accountability watchers
--
-- Features:
-- - Auto-unlock when current_value crosses target
-- - Streak calculation function
-- - Commitment rate tracking
-- - Public watchability for accountability
-- =====================================================
