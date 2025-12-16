# 🏔️ SFHT ASCENT

**Success. Failure. Hope. Trust.**

A gamified founder journey tracker where you visualize your startup progress as climbing a mountain. Every strategy becomes a step, every success moves you higher, and every milestone is celebrated.

---

## ✨ Features

- 🎯 **Goal Setting**: Define your peak (e.g., "$10K MRR")
- ⛰️ **Mountain Visualization**: Watch your avatar climb as you make progress
- 📊 **Strategy Tracking**: Add steps, mark them as Success/Failure/In-Progress
- 🎉 **Milestone Celebrations**: Confetti animations at 25%, 50%, 75%, 100%
- 📈 **Founder Stats**: Track success rate, total steps, and achievements
- 🏆 **Achievement System**: Unlock badges as you progress

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- A Supabase account (free tier works!)

### 1. Clone & Install
```bash
cd SFHT_Ascent
npm install
```

### 2. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
3. Go to **Settings > API** and copy your credentials
4. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Run the App
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🎨 Design Philosophy

**Premium Founder Experience**
- Deep Royal Blue (#0F1F3D) - Focus & depth
- Soft Gold (#E7C778) - Achievement & success
- Accent Teal (#1CC5A3) - Progress & growth

**Gamified but Professional**
- Smooth animations (Framer Motion)
- Glassmorphism effects
- Motivational microcopy
- Dopamine-rich interactions

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth + PostgreSQL)
- **Icons**: Lucide React
- **Celebrations**: Canvas Confetti

---

## 📁 Project Structure

```
SFHT_Ascent/
├── src/
│   ├── components/
│   │   ├── Layout.jsx       # Navigation wrapper
│   │   ├── Mountain.jsx     # Core visualization
│   │   └── StepCard.jsx     # Strategy card UI
│   ├── pages/
│   │   ├── Landing.jsx      # Hero page
│   │   ├── Auth.jsx         # Login/Signup
│   │   ├── Dashboard.jsx    # Main mountain view
│   │   └── Profile.jsx      # Stats & achievements
│   ├── context/
│   │   └── AuthContext.jsx  # User session
│   ├── lib/
│   │   └── supabase.js      # DB client
│   └── App.jsx              # Router
├── supabase_schema.sql      # Database schema
└── package.json
```

---

## 🎯 Usage

1. **Sign Up**: Create your founder account
2. **Add Steps**: Click "Add Step" to log a strategy
3. **Track Progress**: Mark steps as Success/Failure/In-Progress
4. **Watch Your Climb**: Your avatar moves up the mountain
5. **Celebrate Wins**: Hit milestones and enjoy the confetti 🎊

---

## 🔮 Future Enhancements

- [ ] Social sharing (Twitter/X integration)
- [ ] Weekly review summaries
- [ ] Consistency streak tracking
- [ ] Team/co-founder mode
- [ ] Custom mountain themes
- [ ] Export journey as image

---

## 📄 License

MIT License - Build your dreams! 🚀

---

**Made for founders who embrace the climb.** 🏔️
