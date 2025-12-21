-- =====================================================
-- SHIFT ASCENT - Supabase Schema (MVP)
-- =====================================================
-- Run this in Supabase SQL Editor
-- 
-- Tables:
--   - mountains: User's journey mountain (1 per user)
--   - steps: Strategy steps on the mountain
--   - sticky_notes: Journey notes/lessons for each step
--
-- RLS: All tables enforce user_id = auth.uid()
-- =====================================================

-- ===================
-- MOUNTAINS TABLE
-- ===================
create table if not exists public.mountains (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  target text not null,
  mountain_type text default 'startup',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.mountains enable row level security;

-- Policies
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
  user_id uuid references auth.users not null,
  mountain_id uuid references public.mountains on delete cascade not null,
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

-- Policies
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
-- STICKY NOTES TABLE (Journey Notes)
-- ===================
create table if not exists public.sticky_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  step_id uuid references public.steps on delete cascade not null,
  summary text,
  lesson_learned text,
  next_action text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sticky_notes enable row level security;

-- Policies
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
-- INDEXES
-- ===================
create index if not exists idx_mountains_user_id on public.mountains(user_id);
create index if not exists idx_steps_mountain_id on public.steps(mountain_id);
create index if not exists idx_steps_user_id on public.steps(user_id);
create index if not exists idx_sticky_notes_step_id on public.sticky_notes(step_id);
create index if not exists idx_sticky_notes_user_id on public.sticky_notes(user_id);

-- ===================
-- UPDATED_AT TRIGGER
-- ===================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_mountains_updated_at
  before update on public.mountains
  for each row execute function update_updated_at_column();

create trigger update_steps_updated_at
  before update on public.steps
  for each row execute function update_updated_at_column();

create trigger update_sticky_notes_updated_at
  before update on public.sticky_notes
  for each row execute function update_updated_at_column();
