-- =====================================================
-- PROMISE DEADLINE & BROKEN PROMISE MIGRATION
-- Adds deadline-based milestones with consequences
-- =====================================================

-- 1. Add new columns to lock_milestones
-- Deadline for time-based milestones
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Consequence when promise is broken
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS consequence TEXT;

-- Track if promise was broken
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS is_broken BOOLEAN DEFAULT FALSE;

-- Reason why promise was broken (user's reflection)
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS broken_reason TEXT;

-- When the promise was broken
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS broken_at TIMESTAMP WITH TIME ZONE;

-- Milestone type: 'value' (reach $X), 'task' (complete by deadline), or 'hybrid' (both)
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS milestone_type TEXT DEFAULT 'value' CHECK (milestone_type IN ('value', 'task', 'hybrid'));

-- Task description (for task-based milestones)
ALTER TABLE lock_milestones
ADD COLUMN IF NOT EXISTS task_description TEXT;

-- 2. Create index for deadline queries
CREATE INDEX IF NOT EXISTS idx_lock_milestones_deadline ON lock_milestones(deadline) WHERE deadline IS NOT NULL AND is_unlocked = FALSE AND is_broken = FALSE;

-- 3. Function to check and mark expired deadlines
CREATE OR REPLACE FUNCTION check_expired_deadlines()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
BEGIN
    -- Mark milestones as broken if deadline has passed and not unlocked
    UPDATE lock_milestones
    SET
        is_broken = TRUE,
        broken_at = NOW(),
        updated_at = NOW()
    WHERE deadline IS NOT NULL
    AND deadline < NOW()
    AND is_unlocked = FALSE
    AND is_broken = FALSE;

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to manually mark a milestone as broken (with reason)
CREATE OR REPLACE FUNCTION mark_milestone_broken(
    milestone_uuid UUID,
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE lock_milestones
    SET
        is_broken = TRUE,
        broken_at = NOW(),
        broken_reason = reason,
        updated_at = NOW()
    WHERE id = milestone_uuid
    AND is_unlocked = FALSE;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to get upcoming deadlines for a user
CREATE OR REPLACE FUNCTION get_upcoming_deadlines(user_uuid UUID, hours_ahead INTEGER DEFAULT 24)
RETURNS TABLE (
    id UUID,
    title TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    commitment TEXT,
    consequence TEXT,
    hours_remaining NUMERIC,
    mountain_title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lm.id,
        lm.title,
        lm.deadline,
        lm.commitment,
        lm.consequence,
        EXTRACT(EPOCH FROM (lm.deadline - NOW())) / 3600 as hours_remaining,
        m.title as mountain_title
    FROM lock_milestones lm
    JOIN mountains m ON m.id = lm.mountain_id
    WHERE lm.user_id = user_uuid
    AND lm.deadline IS NOT NULL
    AND lm.deadline > NOW()
    AND lm.deadline < NOW() + (hours_ahead || ' hours')::INTERVAL
    AND lm.is_unlocked = FALSE
    AND lm.is_broken = FALSE
    ORDER BY lm.deadline ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update the milestone_progress_view to include new fields
DROP VIEW IF EXISTS milestone_progress_view;
CREATE OR REPLACE VIEW milestone_progress_view AS
SELECT
    lm.id,
    lm.mountain_id,
    lm.user_id,
    lm.target_value,
    lm.title,
    lm.commitment,
    lm.consequence,
    lm.reward,
    lm.icon_emoji,
    lm.is_unlocked,
    lm.unlocked_at,
    lm.is_broken,
    lm.broken_at,
    lm.broken_reason,
    lm.deadline,
    lm.milestone_type,
    lm.task_description,
    lm.sort_order,
    m.current_value,
    m.target_value as journey_target,
    m.metric_prefix,
    m.metric_suffix,
    CASE
        WHEN m.target_value > 0 THEN ROUND((m.current_value / m.target_value) * 100, 1)
        ELSE 0
    END as journey_progress,
    CASE
        WHEN lm.deadline IS NOT NULL AND lm.deadline > NOW() THEN
            EXTRACT(EPOCH FROM (lm.deadline - NOW()))
        ELSE NULL
    END as seconds_remaining,
    (SELECT COUNT(*) FROM daily_checkins dc WHERE dc.milestone_id = lm.id) as total_checkins,
    (SELECT COUNT(*) FROM daily_checkins dc WHERE dc.milestone_id = lm.id AND dc.kept_promise = TRUE) as kept_checkins,
    (SELECT COUNT(*) FROM milestone_watchers mw WHERE mw.milestone_id = lm.id) as watcher_count
FROM lock_milestones lm
JOIN mountains m ON m.id = lm.mountain_id;

-- =====================================================
-- MIGRATION COMPLETE
--
-- New fields added to lock_milestones:
-- - deadline: When the promise must be fulfilled
-- - consequence: What happens if promise is broken
-- - is_broken: Whether the promise was broken
-- - broken_reason: User's reflection on why they failed
-- - broken_at: When the promise was broken
-- - milestone_type: 'value', 'task', or 'hybrid'
-- - task_description: Description of the task to complete
--
-- New functions:
-- - check_expired_deadlines(): Marks expired milestones as broken
-- - mark_milestone_broken(): Manually mark a milestone as broken
-- - get_upcoming_deadlines(): Get deadlines within X hours
--
-- Run this after the base lock_milestones migration
-- =====================================================
