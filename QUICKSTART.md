# Quick Start Guide

## ✅ App is Now Running!

The blank page issue has been fixed. The app now runs in **demo mode** when Supabase credentials are not configured.

---

## 🎯 What You Can Do Now

### Option 1: View the UI (Demo Mode - Current)
- The landing page should now be visible at `http://localhost:5174`
- You can see all the UI components and animations
- **Note**: Auth and data persistence won't work without Supabase

### Option 2: Full Setup (Recommended for Testing)
To get the full experience with working authentication and data:

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com/)
   - Sign up (free)
   - Create a new project

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Copy contents of `d:/SFHT_Ascent/supabase_schema.sql`
   - Paste and click "Run"

3. **Get API Credentials**
   - Go to **Settings > API**
   - Copy `Project URL`
   - Copy `anon public` key

4. **Create .env File**
   - In `d:/SFHT_Ascent/`, create a file named `.env`
   - Add:
     ```env
     VITE_SUPABASE_URL=your_project_url_here
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

5. **Restart Dev Server**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

---

## 🎨 What to Look For

### Landing Page
- Animated gradient title: "Climb Your Founder Journey"
- Mountain background image
- Three feature cards
- Glowing "Start Your Ascent" button

### After Supabase Setup
- Click "Start Ascent" → Sign up
- Dashboard with mountain visualization
- Add strategies and watch your avatar climb
- Confetti celebrations at milestones

---

## 🐛 Troubleshooting

**Still seeing blank page?**
- Hard refresh: `Ctrl + Shift + R`
- Check browser console (F12) for errors
- Make sure dev server is running

**Port 5174 not working?**
- Check terminal for actual port (might be 5173)
- Vite auto-increments if port is busy
