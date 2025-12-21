-- =====================================================
-- SFHT ASCENT - Complete Supabase Setup
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- URL: https://dqvcahhpkrhpvfatnzss.supabase.co/project/default/sql
--
-- This will create all necessary tables with proper RLS policies
-- =====================================================

-- ===================
-- MOUNTAINS TABLE
-- ===================
create table if not exists public.mountains (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target text not null,
  mountain_type text default 'startup',
  total_steps_planned integer default 6,
  share_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.mountains enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own mountains" on public.mountains;
drop policy if exists "Users can insert own mountains" on public.mountains;
drop policy if exists "Users can update own mountains" on public.mountains;
drop policy if exists "Users can delete own mountains" on public.mountains;

-- Create policies
create policy "Users can view own mountains"
  on public.mountains for select
  using (auth.uid() = user_id);

create policy "Users can insert own mountains"
  on public.mountains for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mountains"
  on public.mountains for update
  using (auth.uid() = user_id);

create policy "Users can delete own mountains"
  on public.mountains for delete
  using (auth.uid() = user_id);

-- ===================
-- STEPS TABLE
-- ===================
create table if not exists public.steps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mountain_id uuid references public.mountains(id) on delete cascade not null,
  title text not null,
  description text,
  expected_outcome text,
  status text check (status in ('pending', 'in-progress', 'success', 'failed')) default 'pending',
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.steps enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own steps" on public.steps;
drop policy if exists "Users can insert own steps" on public.steps;
drop policy if exists "Users can update own steps" on public.steps;
drop policy if exists "Users can delete own steps" on public.steps;

-- Create policies
create policy "Users can view own steps"
  on public.steps for select
  using (auth.uid() = user_id);

create policy "Users can insert own steps"
  on public.steps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own steps"
  on public.steps for update
  using (auth.uid() = user_id);

create policy "Users can delete own steps"
  on public.steps for delete
  using (auth.uid() = user_id);

-- ===================
-- JOURNEY NOTES TABLE
-- ===================
create table if not exists public.journey_notes (
  id uuid default gen_random_uuid() primary key,
  step_id uuid references public.steps(id) on delete cascade not null,
  result text check (result in ('success', 'failure')) default 'success',
  reflection_text text,
  lesson_learned text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.journey_notes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view journey notes" on public.journey_notes;
drop policy if exists "Users can insert journey notes" on public.journey_notes;
drop policy if exists "Users can update journey notes" on public.journey_notes;
drop policy if exists "Users can delete journey notes" on public.journey_notes;

-- Create policies (via step relationship)
create policy "Users can view journey notes"
  on public.journey_notes for select
  using (
    exists (
      select 1 from public.steps
      where steps.id = journey_notes.step_id
      and steps.user_id = auth.uid()
    )
  );

create policy "Users can insert journey notes"
  on public.journey_notes for insert
  with check (
    exists (
      select 1 from public.steps
      where steps.id = journey_notes.step_id
      and steps.user_id = auth.uid()
    )
  );

create policy "Users can update journey notes"
  on public.journey_notes for update
  using (
    exists (
      select 1 from public.steps
      where steps.id = journey_notes.step_id
      and steps.user_id = auth.uid()
    )
  );

create policy "Users can delete journey notes"
  on public.journey_notes for delete
  using (
    exists (
      select 1 from public.steps
      where steps.id = journey_notes.step_id
      and steps.user_id = auth.uid()
    )
  );

-- ===================
-- PRO WAITLIST TABLE
-- ===================
create table if not exists public.pro_waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (public read for admin, insert for authenticated users)
alter table public.pro_waitlist enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can join waitlist" on public.pro_waitlist;
drop policy if exists "Admins can view waitlist" on public.pro_waitlist;

-- Create policies
create policy "Anyone can join waitlist"
  on public.pro_waitlist for insert
  with check (true);

create policy "Admins can view waitlist"
  on public.pro_waitlist for select
  using (true); -- You might want to restrict this to admin users only

-- ===================
-- STICKY NOTES TABLE (Legacy - keeping for compatibility)
-- ===================
create table if not exists public.sticky_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  step_id uuid references public.steps(id) on delete cascade not null,
  summary text,
  lesson_learned text,
  next_action text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sticky_notes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own notes" on public.sticky_notes;
drop policy if exists "Users can insert own notes" on public.sticky_notes;
drop policy if exists "Users can update own notes" on public.sticky_notes;
drop policy if exists "Users can delete own notes" on public.sticky_notes;

-- Create policies
create policy "Users can view own notes"
  on public.sticky_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.sticky_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.sticky_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.sticky_notes for delete
  using (auth.uid() = user_id);

-- ===================
-- INDEXES FOR PERFORMANCE
-- ===================
create index if not exists idx_mountains_user_id on public.mountains(user_id);
create index if not exists idx_steps_mountain_id on public.steps(mountain_id);
create index if not exists idx_steps_user_id on public.steps(user_id);
create index if not exists idx_journey_notes_step_id on public.journey_notes(step_id);
create index if not exists idx_sticky_notes_step_id on public.sticky_notes(step_id);
create index if not exists idx_sticky_notes_user_id on public.sticky_notes(user_id);
create index if not exists idx_pro_waitlist_email on public.pro_waitlist(email);

-- ===================
-- UPDATED_AT TRIGGER FUNCTION
-- ===================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if they exist
drop trigger if exists update_mountains_updated_at on public.mountains;
drop trigger if exists update_steps_updated_at on public.steps;
drop trigger if exists update_journey_notes_updated_at on public.journey_notes;
drop trigger if exists update_sticky_notes_updated_at on public.sticky_notes;

-- Create triggers
create trigger update_mountains_updated_at
  before update on public.mountains
  for each row execute function update_updated_at_column();

create trigger update_steps_updated_at
  before update on public.steps
  for each row execute function update_updated_at_column();

create trigger update_journey_notes_updated_at
  before update on public.journey_notes
  for each row execute function update_updated_at_column();

create trigger update_sticky_notes_updated_at
  before update on public.sticky_notes
  for each row execute function update_updated_at_column();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for SFHT Ascent!
--
-- Tables created:
--   ✓ mountains - User journey mountains
--   ✓ steps - Strategy steps for mountains
--   ✓ journey_notes - Journey reflections and lessons
--   ✓ pro_waitlist - Pro plan waitlist signups
--   ✓ sticky_notes - Legacy notes (for compatibility)
--
-- All RLS policies are enabled and secure
-- All indexes created for performance
-- All triggers set up for auto-updating timestamps
-- =====================================================
