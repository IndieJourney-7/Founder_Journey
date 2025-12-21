# Database Setup Instructions

## Problem
You're getting this error:
```
Could not find the table 'public.mountains' in the schema cache
```

This means the `mountains` table doesn't exist in your Supabase database yet.

## Solution

Follow these steps to create all required database tables:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dqvcahhpkrhpvfatnzss
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query** button

### Step 2: Copy and Execute the Setup SQL

1. Open the file `supabase_complete_setup.sql` in this repository
2. Copy the entire contents
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

After running the SQL, verify the tables exist:

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `mountains` - Stores user journey mountains
   - `steps` - Stores strategy steps for each mountain
   - `sticky_notes` - Stores journey notes/lessons

### Step 4: Test Your App

1. Go back to your app: https://shift-journey.vercel.app
2. Log in with your account
3. Try creating a new mountain by typing "Climb Begin"
4. The error should be gone!

## What This SQL Does

The `supabase_complete_setup.sql` file creates:

### Mountains Table
- Stores your journey mountains
- Fields: `id`, `user_id`, `title`, `target`, `mountain_type`, `total_steps_planned`, `share_count`
- One mountain per user (enforced in code)

### Steps Table
- Stores strategy steps for each mountain
- Fields: `id`, `user_id`, `mountain_id`, `title`, `description`, `status`, `order_index`
- Status can be: pending, in-progress, success, failed

### Sticky Notes Table
- Stores journey notes and lessons learned
- Fields: `id`, `user_id`, `step_id`, `summary`, `lesson_learned`, `next_action`

### Security (RLS Policies)
- All tables have Row Level Security enabled
- Users can only view/edit their own data
- Policies use `auth.uid()` to ensure data privacy

## Troubleshooting

### If you get "relation already exists" errors:
This is fine! It means some tables already exist. The SQL uses `create table if not exists` so it won't overwrite existing data.

### If you still get the error after running the SQL:
1. Check that you're logged in to the correct Supabase project
2. Try refreshing the app page (hard refresh: Ctrl+Shift+R)
3. Check browser console for any new errors

### If you want to start fresh:
**WARNING: This will delete all data!**

Run this in SQL Editor first:
```sql
drop table if exists public.sticky_notes cascade;
drop table if exists public.steps cascade;
drop table if exists public.mountains cascade;
```

Then run the `supabase_complete_setup.sql` again.

## Need Help?

If you're still having issues, check:
1. Are you logged into the correct Supabase project?
2. Does your user have permission to create tables?
3. Check the Supabase logs for detailed error messages
