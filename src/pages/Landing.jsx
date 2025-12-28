import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mountain, Trophy, Share2, Flame, TrendingUp, Users, Zap } from 'lucide-react';
import MountainBackground from '../components/mountain/MountainBackground';
import MountainDashboard from '../components/mountain/MountainDashboard';

const Landing = () => {
    // Inspiring Mock Data showing a real founder journey
    const mockSteps = [
        { id: 1, title: 'Validate Idea', status: 'success', order_index: 0 },
        { id: 2, title: 'Build MVP', status: 'success', order_index: 1 },
        { id: 3, title: 'First 10 Users', status: 'success', order_index: 2 },
        { id: 4, title: 'Product Hunt Launch', status: 'failed', order_index: 3 },
        { id: 5, title: 'Iterate & Relaunch', status: 'success', order_index: 4 },
        { id: 6, title: '$1K MRR', status: 'pending', order_index: 5 },
    ];

    const mockNotes = [
        {
            id: 1,
            step_id: 4,
            summary: "Launched too early",
            lesson_learned: "Should have gathered more testimonials first. Timing matters.",
            next_action: "Build waitlist before next launch",
            result: 'failed'
        },
        {
            id: 2,
            step_id: 5,
            summary: "Pivoted based on feedback",
            lesson_learned: "Users wanted simpler onboarding. Cut 3 features, doubled signups.",
            next_action: "Focus on core value prop",
            result: 'success'
        }
    ];

    // Testimonials from founders
    const testimonials = [
        {
            quote: "Finally, a way to show my audience I'm actually shipping, not just talking.",
            author: "SaaS Founder",
            handle: "@indiehacker",
            avatar: "S"
        },
        {
            quote: "The Day X format got me 10x more engagement than my regular tweets.",
            author: "Solo Developer",
            handle: "@solodev",
            avatar: "D"
        },
        {
            quote: "My investors love seeing the visual progress updates. Saves me weekly calls.",
            author: "Startup CEO",
            handle: "@startupfounder",
            avatar: "C"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0F1F3D] text-white overflow-hidden">

            {/* Hero Section - Founder Focused */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-0">
                {/* Background */}
                <div className="absolute inset-0 bg-[#0F1F3D] z-0" />
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

                    {/* Left Column: Founder-Focused Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left max-w-2xl"
                    >
                        {/* Build in Public Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full mb-6">
                            <Flame size={16} className="text-brand-gold" />
                            <span className="text-brand-gold font-bold text-sm">#BUILDINPUBLIC</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight sm:leading-none text-white">
                            Turn Your<br />
                            Founder Journey<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Into Viral Content
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 leading-relaxed max-w-lg">
                            Track milestones. Share progress banners. Build your audience while you build your product.
                        </p>
                        <p className="text-base text-slate-400 mb-8 sm:mb-10">
                            Day 1 → $10K MRR, visualized. Every win and lesson becomes shareable content in 60 seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                            <Link
                                to="/dashboard"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-gold text-brand-blue font-bold text-base sm:text-lg rounded-xl hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                Try Demo (Pre-filled) <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/auth?mode=signup"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                Sign Up Free
                            </Link>
                        </div>

                        <p className="mt-4 text-xs sm:text-sm text-slate-400">
                            No credit card required • See real demo data instantly • Start sharing today
                        </p>

                        {/* Social Proof - More Specific */}
                        <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {['🚀', '💻', '📈'].map((emoji, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0F1F3D] flex items-center justify-center text-sm">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <p className="leading-tight">100+ founders building in public</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Share2 size={16} className="text-brand-teal" />
                                <span>500+ banners shared this month</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mt-8 lg:mt-0"
                    >
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] aspect-square sm:aspect-[4/3] md:aspect-[16/10] group">
                            <div className="absolute inset-0 z-50 bg-transparent pointer-events-none border-2 sm:border-4 border-white/5 rounded-xl sm:rounded-2xl" />

                            <MountainDashboard
                                steps={mockSteps}
                                stickyNotes={mockNotes}
                                progress={72}
                                missionName="$10K MRR Journey"
                                goalTarget="$10k MRR"
                                titleSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                                onStepClick={() => { }}
                                onAddStickyNote={() => { }}
                            />

                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50 bg-black/50 backdrop-blur border border-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono text-white/70 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Day 47 • Live
                            </div>
                        </div>

                        <div className="hidden sm:block absolute -z-10 top-[-20px] right-[-20px] w-full h-full border border-brand-gold/20 rounded-2xl" />
                        <div className="hidden sm:block absolute -z-20 top-[-40px] right-[-40px] w-full h-full border border-brand-gold/10 rounded-2xl" />
                    </motion.div>

                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-b from-[#0F1F3D] to-[#0a1529]">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            What <span className="text-brand-gold">#BuildInPublic</span> Founders Say
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-colors"
                            >
                                <p className="text-white/90 mb-4 italic">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center font-bold text-brand-blue">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{t.author}</p>
                                        <p className="text-brand-teal text-xs">{t.handle}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Founder Journey */}
            <section className="py-20 sm:py-32 bg-[#0a1529] relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Build. Track. Share. Grow.
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                            Turn your startup journey into content that builds your audience
                        </p>
                    </motion.div>

                    <div className="max-w-6xl mx-auto space-y-32">

                        {/* Step 1: Pick Your Journey Template */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="order-2 lg:order-1">
                                    <div className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full mb-4">
                                        <span className="text-brand-gold font-bold text-sm">STEP 1</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Pick Your Journey Template
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Start with founder-proven templates: SaaS Launch, Funding Round,
                                        Product Hunt Launch, or create your own custom journey.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            '🚀 SaaS: $0 → $10K MRR Journey',
                                            '💰 Fundraising: Pre-seed to Seed',
                                            '🎯 Product Hunt: Launch Day Prep',
                                            '📱 App Launch: Idea to App Store'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <span className="text-lg">{item.split(' ')[0]}</span>
                                                <span>{item.split(' ').slice(1).join(' ')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="order-1 lg:order-2 relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] transform lg:hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="/img2.png"
                                            alt="Journey Templates"
                                            className="w-full"
                                            style={{ filter: 'brightness(1.1)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:block absolute left-1/2 bottom-0 transform translate-y-1/2 -mb-16">
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="w-1 h-32 bg-gradient-to-b from-brand-gold via-brand-teal to-transparent origin-top"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, #E7C778 0px, #E7C778 10px, transparent 10px, transparent 20px)',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Step 2: Log Wins & Lessons */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-[#0a1529] to-[#0F1F3D] p-8">
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-green-400 text-xl">✅</span>
                                                    <span className="font-bold text-green-400">WIN: First Paying Customer!</span>
                                                </div>
                                                <p className="text-white/70 text-sm">"Cold outreach worked. 10 DMs → 1 customer → $49 MRR"</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-yellow-400 text-xl">💡</span>
                                                    <span className="font-bold text-yellow-400">LESSON: Pricing Too Low</span>
                                                </div>
                                                <p className="text-white/70 text-sm">"3 users said they'd pay 2x. Testing $99 tier next week."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="inline-block px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full mb-4">
                                        <span className="text-brand-teal font-bold text-sm">STEP 2</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Log Wins & Lessons Daily
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Every experiment has an outcome. Celebrate wins. Learn from failures.
                                        Your journey becomes a goldmine of shareable insights.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            'Quick "Day X" format for consistency',
                                            'Auto-calculated streaks and stats',
                                            'Tag experiments by category',
                                            'Export any lesson as a viral post'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-brand-teal" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="hidden lg:block absolute left-1/2 bottom-0 transform translate-y-1/2 -mb-16">
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="w-1 h-32"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, #1CC5A3 0px, #1CC5A3 10px, transparent 10px, transparent 20px)',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Step 3: Watch Progress in Real-Time */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="order-2 lg:order-1">
                                    <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
                                        <span className="text-purple-400 font-bold text-sm">STEP 3</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Watch Your Climb in Real-Time
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Your avatar climbs higher with every milestone. Checkpoints show
                                        where you've been. The peak shows where you're going.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            'Animated climber shows real progress',
                                            'Milestones marked on the mountain',
                                            'Confetti celebrations for big wins',
                                            'Daily motivation from your journey'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="order-1 lg:order-2 relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] aspect-square transform lg:hover:scale-105 transition-transform duration-500">
                                        <MountainDashboard
                                            steps={mockSteps}
                                            stickyNotes={mockNotes}
                                            progress={72}
                                            missionName="$10K MRR"
                                            goalTarget="$10k MRR"
                                            titleSize="text-xl sm:text-2xl"
                                            onStepClick={() => {}}
                                            onAddStickyNote={() => {}}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:block absolute left-1/2 bottom-0 transform translate-y-1/2 -mb-16">
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="w-1 h-32"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, #a855f7 0px, #a855f7 10px, transparent 10px, transparent 20px)',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Step 4: Share & Go Viral */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] transform lg:hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="/img1.png"
                                            alt="Share Journey Banner"
                                            className="w-full"
                                            style={{ filter: 'brightness(1.1)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <div className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full mb-4">
                                        <span className="text-brand-gold font-bold text-sm">STEP 4</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Share & Go Viral
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        One-click export to X, LinkedIn, Instagram. Pre-written viral
                                        tweets with #buildinpublic hashtags. Your audience grows while you build.
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            '"Day X" format that creates FOMO',
                                            'Auto-generated viral tweet text',
                                            'Stats flex: wins, lessons, progress %',
                                            'Thread starter templates included'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mt-24"
                    >
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-gold to-yellow-400 text-brand-blue font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-brand-gold/30 transition-all transform hover:-translate-y-1"
                        >
                            Start Building in Public <ArrowRight size={24} />
                        </Link>
                        <p className="text-slate-400 mt-4">Free • Pre-filled demo • Share your first post today</p>
                    </motion.div>
                </div>
            </section>

            {/* Why Founders Love This */}
            <section className="py-16 sm:py-20 bg-[#0F1F3D]">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Why <span className="text-brand-gold">Founders</span> Choose Shift Journey
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { icon: <Flame size={32} />, title: "FOMO-Inducing", desc: "'Day 47' format makes followers want to follow your journey from Day 1." },
                            { icon: <TrendingUp size={32} />, title: "Proof of Work", desc: "Visual progress that proves you're shipping, not just talking." },
                            { icon: <Users size={32} />, title: "Audience Builder", desc: "Every share brings new followers. Your journey is your content strategy." },
                            { icon: <Zap size={32} />, title: "60-Second Posts", desc: "From insight to viral post in one click. No more blank page anxiety." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/50 transition-colors group text-center"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-blue rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-brand-gold group-hover:scale-110 transition-transform mx-auto">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-b from-[#0F1F3D] to-[#0a1529]">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                            Your Journey Starts <span className="text-brand-gold">Now</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join 100+ founders turning their build-in-public journey into audience growth.
                        </p>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-gold to-yellow-400 text-brand-blue font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-brand-gold/30 transition-all transform hover:-translate-y-1"
                        >
                            Try Demo with Real Data <ArrowRight size={24} />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
