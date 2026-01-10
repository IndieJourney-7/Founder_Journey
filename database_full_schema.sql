-- =====================================================
-- SHIFT ASCENT - FULL SUPABASE DATABASE SCHEMA
-- Complete schema for the mountain goal tracker app
-- =====================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MOUNTAINS TABLE (Core)
-- The main goal/journey tracking table
-- =====================================================
CREATE TABLE IF NOT EXISTS mountains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic info
    title TEXT NOT NULL,                     -- e.g., "$10K MRR Journey"
    target TEXT NOT NULL,                    -- Display name e.g., "$10,000 MRR"

    -- Metric tracking (for numeric progress)
    current_value NUMERIC DEFAULT 0,         -- Current progress value
    target_value NUMERIC DEFAULT 0,          -- Target goal value
    metric_prefix TEXT DEFAULT '',           -- e.g., "$"
    metric_suffix TEXT DEFAULT '',           -- e.g., "MRR", "users"
    progress_history JSONB DEFAULT '[]'::JSONB,  -- Historical progress data

    -- Step-based tracking (legacy)
    total_steps_planned INTEGER DEFAULT 6,

    -- Public profile
    username TEXT UNIQUE,                    -- Unique URL slug for public profile
    is_public BOOLEAN DEFAULT FALSE,         -- Whether journey is publicly visible
    public_bio TEXT,                         -- Bio shown on public profile

    -- Social/engagement
    encouragement_count INTEGER DEFAULT 0,   -- Total cheers received
    is_featured BOOLEAN DEFAULT FALSE,       -- Featured on discovery page
    featured_at TIMESTAMP WITH TIME ZONE,
    last_milestone_shared INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for mountains
CREATE INDEX IF NOT EXISTS idx_mountains_user ON mountains(user_id);
CREATE INDEX IF NOT EXISTS idx_mountains_username ON mountains(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mountains_public ON mountains(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_mountains_featured ON mountains(is_featured, featured_at DESC) WHERE is_featured = TRUE;

-- =====================================================
-- 2. STEPS TABLE (Legacy step-based progress)
-- Individual steps/lessons within a mountain journey
-- =====================================================
CREATE TABLE IF NOT EXISTS steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Step content
    title TEXT NOT NULL,                     -- Step title
    description TEXT,                        -- Step description
    lesson TEXT,                             -- Lesson learned

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed')),
    step_number INTEGER,                     -- Order of step

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for steps
CREATE INDEX IF NOT EXISTS idx_steps_mountain ON steps(mountain_id);
CREATE INDEX IF NOT EXISTS idx_steps_user ON steps(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(mountain_id, status);

-- =====================================================
-- 3. JOURNEY_NOTES TABLE
-- Notes/reflections attached to steps
-- =====================================================
CREATE TABLE IF NOT EXISTS journey_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Note content
    content TEXT NOT NULL,                   -- Note text
    note_type TEXT DEFAULT 'reflection' CHECK (note_type IN ('reflection', 'lesson', 'idea', 'blocker', 'win')),

    -- Media (optional)
    image_url TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for journey_notes
CREATE INDEX IF NOT EXISTS idx_journey_notes_step ON journey_notes(step_id);
CREATE INDEX IF NOT EXISTS idx_journey_notes_user ON journey_notes(user_id);

-- =====================================================
-- 4. ENCOURAGEMENTS TABLE
-- Cheers/reactions from public visitors
-- =====================================================
CREATE TABLE IF NOT EXISTS encouragements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,

    -- Reaction data
    emoji TEXT NOT NULL CHECK (emoji IN ('fire', 'muscle', 'rocket', 'star', 'clap', 'heart', 'trophy', 'lightning')),
    sender_name TEXT,                        -- Optional name (anonymous if null)
    message TEXT,                            -- Optional short message

    -- Tracking
    ip_hash TEXT,                            -- For rate limiting
    is_read BOOLEAN DEFAULT FALSE,           -- Owner read status

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for encouragements
CREATE INDEX IF NOT EXISTS idx_encouragements_mountain ON encouragements(mountain_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_created ON encouragements(created_at);
CREATE INDEX IF NOT EXISTS idx_encouragements_unread ON encouragements(mountain_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- 5. MILESTONES TABLE (Legacy percentage-based)
-- Auto-generated milestones at 25%, 50%, 75%, 100%
-- =====================================================
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,

    -- Milestone data
    milestone_type TEXT NOT NULL CHECK (milestone_type IN ('25', '50', '75', '100', 'custom')),
    milestone_value INTEGER,                 -- For custom milestones
    title TEXT NOT NULL,                     -- e.g., "Quarter Way There!"
    description TEXT,

    -- Status
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shared BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for milestones
CREATE INDEX IF NOT EXISTS idx_milestones_mountain ON milestones(mountain_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(milestone_type);

-- =====================================================
-- 6. LOCK_MILESTONES TABLE (New commitment-based system)
-- Milestones with commitments/sacrifices and rewards
-- =====================================================
CREATE TABLE IF NOT EXISTS lock_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Milestone target
    target_value NUMERIC NOT NULL,           -- e.g., 100, 250, 500, 1000
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

-- Indexes for lock_milestones
CREATE INDEX IF NOT EXISTS idx_lock_milestones_mountain ON lock_milestones(mountain_id);
CREATE INDEX IF NOT EXISTS idx_lock_milestones_user ON lock_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_lock_milestones_unlocked ON lock_milestones(mountain_id, is_unlocked);

-- =====================================================
-- 7. DAILY_CHECKINS TABLE
-- Daily promise tracking for commitments
-- =====================================================
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

-- Indexes for daily_checkins
CREATE INDEX IF NOT EXISTS idx_daily_checkins_milestone ON daily_checkins(milestone_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(milestone_id, checkin_date);

-- =====================================================
-- 8. MILESTONE_WATCHERS TABLE
-- Public accountability watchers
-- =====================================================
CREATE TABLE IF NOT EXISTS milestone_watchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES lock_milestones(id) ON DELETE CASCADE,
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,

    -- Watcher info
    watcher_name TEXT,
    watcher_email TEXT,                      -- For notifications

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(milestone_id, watcher_email)
);

-- Indexes for milestone_watchers
CREATE INDEX IF NOT EXISTS idx_milestone_watchers_milestone ON milestone_watchers(milestone_id);

-- =====================================================
-- 9. TRANSACTIONS TABLE (Payments/Pro features)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Transaction data
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

    -- Payment provider info
    provider TEXT,                           -- e.g., 'stripe', 'lemonsqueezy'
    provider_transaction_id TEXT,

    -- Plan info
    plan_type TEXT,                          -- e.g., 'pro_monthly', 'pro_yearly'

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE mountains ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lock_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - MOUNTAINS
-- =====================================================

-- Users can view their own mountains
DROP POLICY IF EXISTS "Users can view own mountains" ON mountains;
CREATE POLICY "Users can view own mountains"
ON mountains FOR SELECT
USING (auth.uid() = user_id);

-- Public mountains are viewable by everyone
DROP POLICY IF EXISTS "Public mountains are viewable by everyone" ON mountains;
CREATE POLICY "Public mountains are viewable by everyone"
ON mountains FOR SELECT
USING (is_public = TRUE);

-- Users can insert their own mountains
DROP POLICY IF EXISTS "Users can insert own mountains" ON mountains;
CREATE POLICY "Users can insert own mountains"
ON mountains FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own mountains
DROP POLICY IF EXISTS "Users can update own mountains" ON mountains;
CREATE POLICY "Users can update own mountains"
ON mountains FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own mountains
DROP POLICY IF EXISTS "Users can delete own mountains" ON mountains;
CREATE POLICY "Users can delete own mountains"
ON mountains FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - STEPS
-- =====================================================

-- Users can view their own steps
DROP POLICY IF EXISTS "Users can view own steps" ON steps;
CREATE POLICY "Users can view own steps"
ON steps FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can view steps for public mountains
DROP POLICY IF EXISTS "Anyone can view steps for public mountains" ON steps;
CREATE POLICY "Anyone can view steps for public mountains"
ON steps FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = steps.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- Users can manage their own steps
DROP POLICY IF EXISTS "Users can manage own steps" ON steps;
CREATE POLICY "Users can manage own steps"
ON steps FOR ALL
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - JOURNEY_NOTES
-- =====================================================

-- Users can manage their own notes
DROP POLICY IF EXISTS "Users can manage own notes" ON journey_notes;
CREATE POLICY "Users can manage own notes"
ON journey_notes FOR ALL
USING (auth.uid() = user_id);

-- Anyone can view notes for public mountains
DROP POLICY IF EXISTS "Anyone can view notes for public mountains" ON journey_notes;
CREATE POLICY "Anyone can view notes for public mountains"
ON journey_notes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM steps
        JOIN mountains ON mountains.id = steps.mountain_id
        WHERE steps.id = journey_notes.step_id
        AND mountains.is_public = TRUE
    )
);

-- =====================================================
-- RLS POLICIES - ENCOURAGEMENTS
-- =====================================================

-- Anyone can view encouragements for public mountains
DROP POLICY IF EXISTS "Anyone can view encouragements for public mountains" ON encouragements;
CREATE POLICY "Anyone can view encouragements for public mountains"
ON encouragements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- Mountain owners can view their encouragements
DROP POLICY IF EXISTS "Mountain owners can view their encouragements" ON encouragements;
CREATE POLICY "Mountain owners can view their encouragements"
ON encouragements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- Anyone can send encouragements to public mountains
DROP POLICY IF EXISTS "Anyone can send encouragements to public mountains" ON encouragements;
CREATE POLICY "Anyone can send encouragements to public mountains"
ON encouragements FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- Mountain owners can update encouragements (mark as read)
DROP POLICY IF EXISTS "Mountain owners can mark encouragements as read" ON encouragements;
CREATE POLICY "Mountain owners can mark encouragements as read"
ON encouragements FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- =====================================================
-- RLS POLICIES - MILESTONES (Legacy)
-- =====================================================

-- Users can view their own milestones
DROP POLICY IF EXISTS "Users can view own milestones" ON milestones;
CREATE POLICY "Users can view own milestones"
ON milestones FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestones.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- Anyone can view milestones for public mountains
DROP POLICY IF EXISTS "Anyone can view milestones for public mountains" ON milestones;
CREATE POLICY "Anyone can view milestones for public mountains"
ON milestones FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestones.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- Users can manage their own milestones
DROP POLICY IF EXISTS "Users can manage own milestones" ON milestones;
CREATE POLICY "Users can manage own milestones"
ON milestones FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestones.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- =====================================================
-- RLS POLICIES - LOCK_MILESTONES
-- =====================================================

-- Users can view their own lock_milestones
DROP POLICY IF EXISTS "Users can view own lock_milestones" ON lock_milestones;
CREATE POLICY "Users can view own lock_milestones"
ON lock_milestones FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own lock_milestones
DROP POLICY IF EXISTS "Users can manage own lock_milestones" ON lock_milestones;
CREATE POLICY "Users can manage own lock_milestones"
ON lock_milestones FOR ALL
USING (auth.uid() = user_id);

-- Public can view lock_milestones for public mountains
DROP POLICY IF EXISTS "Public can view lock_milestones for public mountains" ON lock_milestones;
CREATE POLICY "Public can view lock_milestones for public mountains"
ON lock_milestones FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = lock_milestones.mountain_id
        AND mountains.is_public = TRUE
    )
);

-- =====================================================
-- RLS POLICIES - DAILY_CHECKINS
-- =====================================================

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

-- =====================================================
-- RLS POLICIES - MILESTONE_WATCHERS
-- =====================================================

-- Anyone can watch public milestones
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

-- =====================================================
-- RLS POLICIES - TRANSACTIONS
-- =====================================================

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Username validation function
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.username IS NOT NULL THEN
        NEW.username := LOWER(NEW.username);

        IF NEW.username !~ '^[a-z][a-z0-9_]{2,19}$' THEN
            RAISE EXCEPTION 'Username must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and underscores';
        END IF;

        IF NEW.username IN ('admin', 'support', 'help', 'shift', 'ascent', 'api', 'www', 'app', 'dashboard', 'settings', 'profile', 'login', 'signup', 'auth') THEN
            RAISE EXCEPTION 'This username is reserved';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check username availability
CREATE OR REPLACE FUNCTION check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    check_username := LOWER(check_username);

    IF check_username !~ '^[a-z][a-z0-9_]{2,19}$' THEN
        RETURN FALSE;
    END IF;

    IF check_username IN ('admin', 'support', 'help', 'shift', 'ascent', 'api', 'www', 'app', 'dashboard', 'settings', 'profile', 'login', 'signup', 'auth') THEN
        RETURN FALSE;
    END IF;

    RETURN NOT EXISTS (SELECT 1 FROM mountains WHERE username = check_username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment encouragement count
CREATE OR REPLACE FUNCTION increment_encouragement_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mountains
    SET encouragement_count = COALESCE(encouragement_count, 0) + 1
    WHERE id = NEW.mountain_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-unlock lock_milestones when progress changes
CREATE OR REPLACE FUNCTION check_lock_milestone_unlocks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_value IS DISTINCT FROM OLD.current_value THEN
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

-- Calculate streak for a milestone
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

-- Get encouragement summary
CREATE OR REPLACE FUNCTION get_encouragement_summary(mountain_uuid UUID)
RETURNS TABLE (
    total_count BIGINT,
    unread_count BIGINT,
    emoji_breakdown JSONB,
    recent_with_messages JSONB,
    top_supporters JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM encouragements WHERE mountain_id = mountain_uuid)::BIGINT,
        (SELECT COUNT(*) FROM encouragements WHERE mountain_id = mountain_uuid AND is_read = FALSE)::BIGINT,
        (
            SELECT jsonb_object_agg(emoji, cnt)
            FROM (
                SELECT emoji, COUNT(*) as cnt
                FROM encouragements WHERE mountain_id = mountain_uuid GROUP BY emoji
            ) e
        ),
        (
            SELECT jsonb_agg(row_to_json(e))
            FROM (
                SELECT id, emoji, sender_name, message, created_at
                FROM encouragements WHERE mountain_id = mountain_uuid AND message IS NOT NULL
                ORDER BY created_at DESC LIMIT 10
            ) e
        ),
        (
            SELECT jsonb_agg(row_to_json(s))
            FROM (
                SELECT sender_name, COUNT(*) as count
                FROM encouragements WHERE mountain_id = mountain_uuid AND sender_name IS NOT NULL
                GROUP BY sender_name ORDER BY count DESC LIMIT 5
            ) s
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Username validation trigger
DROP TRIGGER IF EXISTS trigger_validate_username ON mountains;
CREATE TRIGGER trigger_validate_username
    BEFORE INSERT OR UPDATE OF username ON mountains
    FOR EACH ROW
    EXECUTE FUNCTION validate_username();

-- Encouragement count trigger
DROP TRIGGER IF EXISTS trigger_increment_encouragement ON encouragements;
CREATE TRIGGER trigger_increment_encouragement
    AFTER INSERT ON encouragements
    FOR EACH ROW
    EXECUTE FUNCTION increment_encouragement_count();

-- Auto-unlock lock_milestones trigger
DROP TRIGGER IF EXISTS trigger_check_lock_milestone_unlocks ON mountains;
CREATE TRIGGER trigger_check_lock_milestone_unlocks
    AFTER UPDATE ON mountains
    FOR EACH ROW
    EXECUTE FUNCTION check_lock_milestone_unlocks();

-- =====================================================
-- VIEWS
-- =====================================================

-- Public featured journeys view
CREATE OR REPLACE VIEW public_featured_journeys AS
SELECT
    m.id,
    m.username,
    m.title,
    m.target,
    m.public_bio,
    COALESCE(m.current_value, 0) as current_value,
    COALESCE(m.target_value, 0) as target_value,
    COALESCE(m.metric_prefix, '') as metric_prefix,
    COALESCE(m.metric_suffix, '') as metric_suffix,
    COALESCE(m.encouragement_count, 0) as encouragement_count,
    m.featured_at,
    m.created_at,
    CASE
        WHEN COALESCE(m.target_value, 0) > 0 THEN
            FLOOR((COALESCE(m.current_value, 0)::FLOAT / m.target_value::FLOAT) * 100)
        ELSE 0
    END as progress_percent
FROM mountains m
WHERE m.is_public = TRUE
AND m.is_featured = TRUE
AND m.username IS NOT NULL
ORDER BY m.featured_at DESC NULLS LAST, m.encouragement_count DESC;

-- Public journeys view (all public)
CREATE OR REPLACE VIEW public_journeys AS
SELECT
    m.id,
    m.username,
    m.title,
    m.target,
    m.public_bio,
    COALESCE(m.current_value, 0) as current_value,
    COALESCE(m.target_value, 0) as target_value,
    COALESCE(m.metric_prefix, '') as metric_prefix,
    COALESCE(m.metric_suffix, '') as metric_suffix,
    COALESCE(m.encouragement_count, 0) as encouragement_count,
    COALESCE(m.is_featured, FALSE) as is_featured,
    m.featured_at,
    m.created_at,
    CASE
        WHEN COALESCE(m.target_value, 0) > 0 THEN
            FLOOR((COALESCE(m.current_value, 0)::FLOAT / m.target_value::FLOAT) * 100)
        ELSE 0
    END as progress_percent
FROM mountains m
WHERE m.is_public = TRUE
AND m.username IS NOT NULL
ORDER BY m.is_featured DESC, m.encouragement_count DESC, m.created_at DESC;

-- Milestone progress view
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
-- SCHEMA COMPLETE
--
-- Tables:
-- 1. mountains - Core goal/journey tracking
-- 2. steps - Step-based progress (legacy)
-- 3. journey_notes - Notes attached to steps
-- 4. encouragements - Public cheers/reactions
-- 5. milestones - Percentage-based milestones (legacy)
-- 6. lock_milestones - Commitment-based milestones (new)
-- 7. daily_checkins - Daily promise tracking
-- 8. milestone_watchers - Public accountability
-- 9. transactions - Payment tracking
--
-- Features:
-- - Metric-based progress tracking (current_value/target_value)
-- - Public profiles with usernames
-- - Lock-in commitment system with daily check-ins
-- - Encouragement/cheer system
-- - Auto-unlock milestones when progress crosses target
-- - Streak calculation for commitments
-- =====================================================
