-- =====================================================
-- MIGRATION: Add 'title' field to journey_notes
-- =====================================================
-- This allows each lesson to have a short title (max 60 chars)
-- separate from the full lesson_learned text
--
-- Run this in Supabase SQL Editor:
-- https://dqvcahhpkrhpvfatnzss.supabase.co/project/default/sql
-- =====================================================

-- Add title column to journey_notes table (required, max 60 chars)
ALTER TABLE public.journey_notes
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Lesson';

-- Add constraint for max 60 characters
ALTER TABLE public.journey_notes
ADD CONSTRAINT journey_notes_title_length CHECK (char_length(title) <= 60);

-- Optional: Generate meaningful titles for existing notes based on lesson_learned
-- (Only if you have existing data)
UPDATE public.journey_notes
SET title = CASE
    WHEN lesson_learned IS NOT NULL AND lesson_learned != ''
    THEN substring(lesson_learned from 1 for 57) || '...'
    ELSE 'Lesson from ' || to_char(created_at, 'Mon DD')
END
WHERE title = 'Untitled Lesson';

-- Verify the change
SELECT id, title, lesson_learned, step_id, created_at
FROM public.journey_notes
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Now journey_notes has:
--   ✓ title field (required, max 60 chars)
--   ✓ Existing notes have auto-generated titles
--   ✓ All new notes must provide a title
-- =====================================================
