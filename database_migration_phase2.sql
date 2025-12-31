-- =====================================================
-- PUBLIC PROFILES PHASE 2 MIGRATION
-- Adds cheer messages, featured journeys, and milestones
-- Run this in Supabase SQL Editor AFTER Phase 1 migration
-- =====================================================

-- 1. Add metric tracking fields to mountains table (if not exists)
-- These support metric-based progress tracking (e.g., $0 → $10K MRR)
ALTER TABLE mountains
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS metric_prefix TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS metric_suffix TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS progress_history JSONB DEFAULT '[]'::JSONB;

-- 2. Add featured profile fields to mountains table
ALTER TABLE mountains
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_milestone_shared INTEGER DEFAULT 0;

-- Create index for featured journeys
CREATE INDEX IF NOT EXISTS idx_mountains_featured ON mountains(is_featured, featured_at DESC) WHERE is_featured = TRUE;

-- 2. Add message tracking to encouragements table
-- Note: message and sender_name columns should already exist from Phase 1
-- If not, uncomment the following:
-- ALTER TABLE encouragements
-- ADD COLUMN IF NOT EXISTS message TEXT,
-- ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Add read status for encouragements (so owners can mark as read)
ALTER TABLE encouragements
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Index for unread encouragements
CREATE INDEX IF NOT EXISTS idx_encouragements_unread ON encouragements(mountain_id, is_read) WHERE is_read = FALSE;

-- 3. Create milestones table for tracking milestone celebrations
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL CHECK (milestone_type IN ('25', '50', '75', '100', 'custom')),
    milestone_value INTEGER, -- For custom milestones (e.g., 10 steps completed)
    title TEXT NOT NULL, -- e.g., "Quarter Way There!", "Halfway Point!"
    description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shared BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for milestone queries
CREATE INDEX IF NOT EXISTS idx_milestones_mountain ON milestones(mountain_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(milestone_type);

-- 4. RLS Policies for milestones

-- Enable RLS on milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Mountain owners can view their milestones
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

-- Mountain owners can update their milestones
DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;
CREATE POLICY "Users can update own milestones"
ON milestones FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestones.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- System can insert milestones (for automatic creation)
DROP POLICY IF EXISTS "System can insert milestones" ON milestones;
CREATE POLICY "System can insert milestones"
ON milestones FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = milestones.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- Public can view milestones for public mountains
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

-- 5. Update encouragements policies to allow reading messages
-- Mountain owners can see sender names and messages
DROP POLICY IF EXISTS "Mountain owners can view encouragement details" ON encouragements;
CREATE POLICY "Mountain owners can view encouragement details"
ON encouragements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- Mountain owners can update read status
DROP POLICY IF EXISTS "Mountain owners can mark encouragements as read" ON encouragements;
CREATE POLICY "Mountain owners can mark encouragements as read"
ON encouragements FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM mountains
        WHERE mountains.id = encouragements.mountain_id
        AND mountains.user_id = auth.uid()
    )
);

-- 6. Function to auto-create milestones when progress changes
-- Supports BOTH metric-based (current_value/target_value) and step-based progress
CREATE OR REPLACE FUNCTION check_milestone_achievements()
RETURNS TRIGGER AS $$
DECLARE
    progress_percent INTEGER;
    old_progress_percent INTEGER;
    completed_steps INTEGER;
    total_steps INTEGER;
    milestone_titles JSONB := '{
        "25": "Quarter Way There!",
        "50": "Halfway Point!",
        "75": "Three Quarters Done!",
        "100": "Summit Reached!"
    }'::JSONB;
    milestone_descs JSONB := '{
        "25": "You''ve completed 25% of your journey. Keep climbing!",
        "50": "You''re halfway to the summit. The view is getting better!",
        "75": "Almost there! The peak is in sight!",
        "100": "Congratulations! You''ve reached the summit!"
    }'::JSONB;
    milestone_key TEXT;
BEGIN
    -- Calculate progress percentage
    -- Method 1: Metric-based (if target_value is set)
    IF COALESCE(NEW.target_value, 0) > 0 THEN
        progress_percent := FLOOR((COALESCE(NEW.current_value, 0)::FLOAT / NEW.target_value::FLOAT) * 100);
        old_progress_percent := FLOOR((COALESCE(OLD.current_value, 0)::FLOAT / NULLIF(COALESCE(OLD.target_value, 0), 0)::FLOAT) * 100);
    ELSE
        -- Method 2: Step-based progress (fallback)
        SELECT
            COUNT(*) FILTER (WHERE status = 'success'),
            GREATEST(COUNT(*), COALESCE(NEW.total_steps_planned, 1))
        INTO completed_steps, total_steps
        FROM steps
        WHERE mountain_id = NEW.id;

        progress_percent := FLOOR((completed_steps::FLOAT / NULLIF(total_steps, 0)::FLOAT) * 100);

        -- Calculate old progress for step-based
        SELECT COUNT(*) FILTER (WHERE status = 'success')
        INTO completed_steps
        FROM steps
        WHERE mountain_id = OLD.id;

        old_progress_percent := FLOOR((completed_steps::FLOAT / NULLIF(total_steps, 0)::FLOAT) * 100);
    END IF;

    -- Handle null cases
    progress_percent := COALESCE(progress_percent, 0);
    old_progress_percent := COALESCE(old_progress_percent, 0);

    -- Check each milestone threshold
    FOREACH milestone_key IN ARRAY ARRAY['25', '50', '75', '100']
    LOOP
        IF progress_percent >= milestone_key::INTEGER AND old_progress_percent < milestone_key::INTEGER THEN
            -- Check if this milestone already exists
            IF NOT EXISTS (
                SELECT 1 FROM milestones
                WHERE mountain_id = NEW.id
                AND milestone_type = milestone_key
            ) THEN
                -- Create the milestone
                INSERT INTO milestones (mountain_id, milestone_type, title, description)
                VALUES (
                    NEW.id,
                    milestone_key,
                    milestone_titles->>milestone_key,
                    milestone_descs->>milestone_key
                );
            END IF;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply milestone trigger on mountain updates
-- Triggers on both current_value changes (metric-based) and any update (step recalc)
DROP TRIGGER IF EXISTS trigger_check_milestones ON mountains;
CREATE TRIGGER trigger_check_milestones
    AFTER UPDATE ON mountains
    FOR EACH ROW
    EXECUTE FUNCTION check_milestone_achievements();

-- 7. View for featured journeys (public discovery)
-- Supports both metric-based and step-based progress calculation
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
    -- Progress: use metric-based if target_value > 0, else use step-based
    CASE
        WHEN COALESCE(m.target_value, 0) > 0 THEN
            FLOOR((COALESCE(m.current_value, 0)::FLOAT / m.target_value::FLOAT) * 100)
        ELSE
            CASE
                WHEN (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id) > 0 THEN
                    FLOOR((SELECT COUNT(*) FROM steps WHERE mountain_id = m.id AND status = 'success')::FLOAT /
                          GREATEST((SELECT COUNT(*) FROM steps WHERE mountain_id = m.id), COALESCE(m.total_steps_planned, 1))::FLOAT * 100)
                ELSE 0
            END
    END as progress_percent,
    (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id AND status = 'success') as completed_steps,
    (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id) as total_steps
FROM mountains m
WHERE m.is_public = TRUE
AND m.is_featured = TRUE
AND m.username IS NOT NULL
ORDER BY m.featured_at DESC NULLS LAST, m.encouragement_count DESC;

-- 8. View for public discovery (all public journeys, not just featured)
-- Supports both metric-based and step-based progress calculation
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
    -- Progress: use metric-based if target_value > 0, else use step-based
    CASE
        WHEN COALESCE(m.target_value, 0) > 0 THEN
            FLOOR((COALESCE(m.current_value, 0)::FLOAT / m.target_value::FLOAT) * 100)
        ELSE
            CASE
                WHEN (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id) > 0 THEN
                    FLOOR((SELECT COUNT(*) FROM steps WHERE mountain_id = m.id AND status = 'success')::FLOAT /
                          GREATEST((SELECT COUNT(*) FROM steps WHERE mountain_id = m.id), COALESCE(m.total_steps_planned, 1))::FLOAT * 100)
                ELSE 0
            END
    END as progress_percent,
    (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id AND status = 'success') as completed_steps,
    (SELECT COUNT(*) FROM steps WHERE mountain_id = m.id) as total_steps
FROM mountains m
WHERE m.is_public = TRUE
AND m.username IS NOT NULL
ORDER BY m.is_featured DESC, m.encouragement_count DESC, m.created_at DESC;

-- 9. Function to get encouragement summary for a mountain owner
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
        (SELECT COUNT(*) FROM encouragements WHERE mountain_id = mountain_uuid)::BIGINT as total_count,
        (SELECT COUNT(*) FROM encouragements WHERE mountain_id = mountain_uuid AND is_read = FALSE)::BIGINT as unread_count,
        (
            SELECT jsonb_object_agg(emoji, cnt)
            FROM (
                SELECT emoji, COUNT(*) as cnt
                FROM encouragements
                WHERE mountain_id = mountain_uuid
                GROUP BY emoji
            ) emoji_counts
        ) as emoji_breakdown,
        (
            SELECT jsonb_agg(row_to_json(e))
            FROM (
                SELECT id, emoji, sender_name, message, created_at
                FROM encouragements
                WHERE mountain_id = mountain_uuid AND message IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 10
            ) e
        ) as recent_with_messages,
        (
            SELECT jsonb_agg(row_to_json(s))
            FROM (
                SELECT sender_name, COUNT(*) as count
                FROM encouragements
                WHERE mountain_id = mountain_uuid AND sender_name IS NOT NULL
                GROUP BY sender_name
                ORDER BY count DESC
                LIMIT 5
            ) s
        ) as top_supporters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PHASE 2 MIGRATION COMPLETE
--
-- New capabilities:
-- - Cheer messages with sender names (viewable by owner)
-- - Read/unread status for encouragements
-- - Automatic milestone tracking (25%, 50%, 75%, 100%)
-- - Featured journeys system
-- - Public discovery view
-- - Encouragement summary function for dashboards
-- =====================================================
