-- MVP Migration

-- 1. Update users table
alter table public.users 
add column if not exists plan_type text check (plan_type in ('free', 'pro')) default 'free';

-- 2. Create mountains table
create table if not exists public.mountains (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  mission_name text not null,
  goal_target text not null,
  mountain_type text default 'startup', -- startup, fitness, study, wealth
  progress_percent numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for mountains
alter table public.mountains enable row level security;

create policy "Users can view their own mountains"
  on public.mountains for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mountains"
  on public.mountains for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mountains"
  on public.mountains for update
  using (auth.uid() = user_id);

create policy "Users can delete their own mountains"
  on public.mountains for delete
  using (auth.uid() = user_id);

-- 3. Update steps table to link to mountains
-- Note: For existing steps, we might need a migration strategy, but for MVP we'll make it nullable initially or assume new data
alter table public.steps 
add column if not exists mountain_id uuid references public.mountains(id);

-- Index for performance
create index if not exists idx_steps_mountain_id on public.steps(mountain_id);
