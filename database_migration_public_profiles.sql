-- =====================================================
-- PUBLIC PROFILES MIGRATION
-- Adds username support and public sharing capabilities
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add public profile fields to mountains table

ALTER TABLE mountains
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_bio TEXT,
ADD COLUMN IF NOT EXISTS encouragement_count INTEGER DEFAULT 0;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_mountains_username ON mountains(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mountains_public ON mountains(is_public) WHERE is_public = TRUE;

-- 2. Create encouragements table for reactions
CREATE TABLE IF NOT EXISTS encouragements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('fire', 'muscle', 'rocket', 'star', 'clap', 'heart', 'trophy', 'lightning')),
    sender_name TEXT, -- Optional: anonymous if null
    message TEXT, -- Optional short message
    ip_hash TEXT, -- For rate limiting without storing actual IP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_encouragements_mountain ON encouragements(mountain_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_created ON encouragements(created_at);

-- 3. Username validation function
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
    -- Username rules: 3-20 chars, lowercase alphanumeric + underscore, must start with letter
    IF NEW.username IS NOT NULL THEN
        -- Convert to lowercase
        NEW.username := LOWER(NEW.username);

        -- Validate format
        IF NEW.username !~ '^[a-z][a-z0-9_]{2,19}$' THEN
            RAISE EXCEPTION 'Username must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and underscores';
        END IF;

        -- Check reserved usernames
        IF NEW.username IN ('admin', 'support', 'help', 'shift', 'ascent', 'api', 'www', 'app', 'dashboard', 'settings', 'profile', 'login', 'signup', 'auth') THEN
            RAISE EXCEPTION 'This username is reserved';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply username validation trigger
DROP TRIGGER IF EXISTS trigger_validate_username ON mountains;
CREATE TRIGGER trigger_validate_username
    BEFORE INSERT OR UPDATE OF username ON mountains
    FOR EACH ROW
    EXECUTE FUNCTION validate_username();

-- 4. RLS Policies for public profiles

-- Allow anyone to read public mountains (for /climb/@username)
DROP POLICY IF EXISTS "Public mountains are viewable by everyone" ON mountains;
CREATE POLICY "Public mountains are viewable by everyone"
ON mountains FOR SELECT
USING (is_public = TRUE);

-- Keep existing policy for owners to manage their own mountains
-- (This should already exist, but we'll make sure)
DROP POLICY IF EXISTS "Users can view own mountains" ON mountains;
CREATE POLICY "Users can view own mountains"
ON mountains FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mountains" ON mountains;
CREATE POLICY "Users can update own mountains"
ON mountains FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mountains" ON mountains;
CREATE POLICY "Users can insert own mountains"
ON mountains FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. RLS for encouragements

-- Enable RLS on encouragements
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

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

-- Mountain owner can view all their encouragements
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

-- Anyone can insert encouragements for public mountains (with anon key)
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

-- 6. RLS for steps - allow public viewing of steps for public mountains

-- Keep existing owner policy
DROP POLICY IF EXISTS "Users can view own steps" ON steps;
CREATE POLICY "Users can view own steps"
ON steps FOR SELECT
USING (auth.uid() = user_id);

-- Add public viewing policy
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

-- 7. RLS for journey_notes - allow public viewing for public mountains

-- Keep existing policies for owners (via step relationship)
-- Add public viewing policy
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

-- 8. Helper function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Normalize to lowercase
    check_username := LOWER(check_username);

    -- Check format
    IF check_username !~ '^[a-z][a-z0-9_]{2,19}$' THEN
        RETURN FALSE;
    END IF;

    -- Check reserved
    IF check_username IN ('admin', 'support', 'help', 'shift', 'ascent', 'api', 'www', 'app', 'dashboard', 'settings', 'profile', 'login', 'signup', 'auth') THEN
        RETURN FALSE;
    END IF;

    -- Check if taken
    RETURN NOT EXISTS (
        SELECT 1 FROM mountains WHERE username = check_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to increment encouragement count atomically
CREATE OR REPLACE FUNCTION increment_encouragement_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mountains
    SET encouragement_count = COALESCE(encouragement_count, 0) + 1
    WHERE id = NEW.mountain_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS trigger_increment_encouragement ON encouragements;
CREATE TRIGGER trigger_increment_encouragement
    AFTER INSERT ON encouragements
    FOR EACH ROW
    EXECUTE FUNCTION increment_encouragement_count();

-- =====================================================
-- MIGRATION COMPLETE
--
-- New capabilities:
-- - Username claiming (unique, validated)
-- - Public/private mountain toggle
-- - Encouragement reactions from visitors
-- - Public viewing of mountain journey
-- =====================================================
