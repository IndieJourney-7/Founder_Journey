-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  step_id text not null, -- Using text to match the mock/demo IDs which are strings, or uuid if real
  content text not null,
  details text,
  next_action text,
  tags text[],
  visibility text check (visibility in ('private', 'public')) default 'private',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.lessons enable row level security;

-- Policies
create policy "Users can view their own lessons"
  on public.lessons for select
  using (auth.uid() = user_id);

create policy "Users can insert their own lessons"
  on public.lessons for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lessons"
  on public.lessons for update
  using (auth.uid() = user_id);

create policy "Users can delete their own lessons"
  on public.lessons for delete
  using (auth.uid() = user_id);
