import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mountain, Trophy, Share2 } from 'lucide-react';
import MountainBackground from '../components/mountain/MountainBackground';
import MountainDashboard from '../components/mountain/MountainDashboard';

const Landing = () => {
    // Mock Data for the Hero Visual
    const mockSteps = [
        { id: 1, title: 'Concept', status: 'success', order_index: 0 },
        { id: 2, title: 'First Prototype', status: 'failed', order_index: 1 },
        { id: 3, title: 'x (twitter)', status: 'success', order_index: 2 },
        { id: 4, title: 'Launch MVP', status: 'pending', order_index: 3 },
    ];

    const mockNotes = [
        {
            id: 1,
            step_id: 2,
            summary: "Too complex",
            lesson_learned: "Users just wanted the core feature. Strip everything else.",
            next_action: "Simplify UI",
            result: 'failed'
        },
        {
            id: 2,
            step_id: 3,
            summary: "They loved it!",
            lesson_learned: "The simple version resonated. Focus on emotional connection.",
            next_action: "Final Polish",
            result: 'success'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0F1F3D] text-white overflow-hidden">

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-0">
                {/* Background (Subtle Global Bg) */}
                <div className="absolute inset-0 bg-[#0F1F3D] z-0" />
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

                    {/* Left Column: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left max-w-2xl"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight sm:leading-none text-white">
                            Track your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Long Journey.
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-10 leading-relaxed max-w-lg">
                            Share what you learn along the way. Turn your grind into a visual ascent.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                            <Link
                                to="/setup"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-gold text-brand-blue font-bold text-base sm:text-lg rounded-xl hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                Start Your Ascent <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/pricing"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-white/10 transition-all text-center"
                            >
                                View Pricing
                            </Link>
                        </div>

                        <div className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 border-2 border-[#0F1F3D]" />
                                ))}
                            </div>
                            <p className="leading-tight">Joined by 50+ founders this week</p>
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mt-8 lg:mt-0"
                    >
                        {/* The Window Frame */}
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] aspect-square sm:aspect-[4/3] md:aspect-[16/10] group">
                            {/* Glass overlay to preventing interaction */}
                            <div className="absolute inset-0 z-50 bg-transparent pointer-events-none border-2 sm:border-4 border-white/5 rounded-xl sm:rounded-2xl" />

                            {/* The Actual Component */}
                            <MountainDashboard
                                steps={mockSteps}
                                stickyNotes={mockNotes}
                                progress={65} // Hardcoded progress for visual
                                missionName="Launch Startup"
                                goalTarget="$10k MRR"
                                // Smaller title size for landing page mobile
                                titleSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                                // No-op handlers for static view
                                onStepClick={() => { }}
                                onAddStickyNote={() => { }}
                            />

                            {/* "Live Preview" Badge */}
                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50 bg-black/50 backdrop-blur border border-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono text-white/70 uppercase tracking-widest">
                                Live Preview
                            </div>
                        </div>

                        {/* Decor elements behind - hidden on mobile */}
                        <div className="hidden sm:block absolute -z-10 top-[-20px] right-[-20px] w-full h-full border border-brand-gold/20 rounded-2xl" />
                        <div className="hidden sm:block absolute -z-20 top-[-40px] right-[-40px] w-full h-full border border-brand-gold/10 rounded-2xl" />
                    </motion.div>

                </div>
            </section>

            {/* Features in Action - Step-by-Step Visual Flow */}
            <section className="py-20 sm:py-32 bg-gradient-to-b from-[#0F1F3D] via-[#0a1529] to-[#0F1F3D] relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Features in Action
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                            Your journey from idea to success, visualized like never before
                        </p>
                    </motion.div>

                    {/* Step-by-Step Flow */}
                    <div className="max-w-6xl mx-auto space-y-32">

                        {/* Step 1: Set Your Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Text Content */}
                                <div className="order-2 lg:order-1">
                                    <div className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full mb-4">
                                        <span className="text-brand-gold font-bold text-sm">STEP 1</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Set Your Mission
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Define your goal and visualize it as climbing a mountain. Whether it's launching a startup,
                                        hitting revenue targets, or building in public - your mountain awaits.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Choose your mission name', 'Set ambitious targets', 'Pick your mountain theme'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-brand-teal" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual */}
                                <div className="order-1 lg:order-2 relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] transform lg:hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="/img2.png"
                                            alt="Set Your Mission - Dashboard Example"
                                            className="w-full"
                                            style={{ filter: 'brightness(1.1)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/20 to-brand-teal/20 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Connecting Line (dotted) */}
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

                        {/* Step 2: Add Strategy Steps */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Visual */}
                                <div className="relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-[#0a1529] to-[#0F1F3D] transform lg:hover:scale-105 transition-transform duration-500 aspect-video flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="text-6xl mb-4">📋</div>
                                            <div className="text-brand-teal text-2xl font-bold mb-2">Map Your Strategy</div>
                                            <div className="text-white/60 text-sm">Add actionable steps and track progress</div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div>
                                    <div className="inline-block px-4 py-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full mb-4">
                                        <span className="text-brand-teal font-bold text-sm">STEP 2</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Map Out Your Strategy
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Break down your mission into actionable steps. Each strategy becomes a checkpoint
                                        on your mountain climb. Plan, execute, and watch your progress unfold.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Add clear action steps', 'Track success & failures', 'See checkpoints on your path'].map((item, i) => (
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

                            {/* Connecting Line */}
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

                        {/* Step 3: Watch Your Climb */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Text Content */}
                                <div className="order-2 lg:order-1">
                                    <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
                                        <span className="text-purple-400 font-bold text-sm">STEP 3</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Watch Your Climb
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        See your avatar ascend the mountain in real-time. Every completed step moves you higher.
                                        Celebrate milestones with confetti and visual rewards.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Real-time progress visualization', 'Animated climber avatar', 'Milestone celebrations'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual - MountainDashboard Live */}
                                <div className="order-1 lg:order-2 relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] aspect-square transform lg:hover:scale-105 transition-transform duration-500">
                                        <MountainDashboard
                                            steps={mockSteps}
                                            stickyNotes={mockNotes}
                                            progress={65}
                                            missionName="Launch Startup"
                                            goalTarget="$10k MRR"
                                            titleSize="text-xl sm:text-2xl"
                                            onStepClick={() => {}}
                                            onAddStickyNote={() => {}}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Connecting Line */}
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

                        {/* Step 4: Share Your Journey */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Visual */}
                                <div className="relative">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1529] transform lg:hover:scale-105 transition-transform duration-500">
                                        <img
                                            src="/img1.png"
                                            alt="Share Journey - Export Banner Example"
                                            className="w-full"
                                            style={{ filter: 'brightness(1.1)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div>
                                    <div className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full mb-4">
                                        <span className="text-brand-gold font-bold text-sm">STEP 4</span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Share Your Journey
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                        Export beautiful, HD banners for X, LinkedIn, and Instagram. Show the world your progress.
                                        Build in public, inspire others, and grow your audience.
                                    </p>
                                    <ul className="space-y-3">
                                        {['HD banner export (Twitter, LinkedIn)', 'Custom themes & branding', 'One-click download & share'].map((item, i) => (
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

                    {/* Video Demo Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="mt-32 relative"
                    >
                        <div className="text-center mb-12">
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                See SHIFT Ascent in Action
                            </h3>
                            <p className="text-white/70 text-lg max-w-2xl mx-auto">
                                Watch how our app transforms your founder journey into an epic mountain climb
                            </p>
                        </div>

                        {/* Video Card */}
                        <div className="max-w-5xl mx-auto relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold/20 via-brand-teal/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                            {/* Video Container */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-black">
                                <video
                                    className="w-full"
                                    controls
                                    poster="/img1.png"
                                    preload="metadata"
                                >
                                    <source src="/shift.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Decorative corner accents */}
                            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-brand-gold rounded-tl-lg" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-brand-teal rounded-tr-lg" />
                            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-brand-teal rounded-bl-lg" />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-brand-gold rounded-br-lg" />
                        </div>

                        {/* Features Highlight Under Video */}
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-3xl mb-3">🎯</div>
                                <h4 className="text-brand-gold font-semibold mb-2">Visual Progress</h4>
                                <p className="text-white/60 text-sm">Watch your climber ascend as you complete steps</p>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-3xl mb-3">📊</div>
                                <h4 className="text-brand-teal font-semibold mb-2">Track Everything</h4>
                                <p className="text-white/60 text-sm">Journal your wins, losses, and lessons learned</p>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-3xl mb-3">🏆</div>
                                <h4 className="text-purple-400 font-semibold mb-2">Celebrate Wins</h4>
                                <p className="text-white/60 text-sm">Milestone animations keep you motivated</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA at the end */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mt-24"
                    >
                        <Link
                            to="/setup"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-gold to-yellow-400 text-brand-blue font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-brand-gold/30 transition-all transform hover:-translate-y-1"
                        >
                            Start Climbing Today <ArrowRight size={24} />
                        </Link>
                        <p className="text-slate-400 mt-4">No credit card required • Free to start</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Features Grid (Original simplified) */}
            <section className="py-16 sm:py-20 bg-[#0F1F3D]">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: <Mountain size={32} />, title: "Visual Progress", desc: "See your journey as a beautiful mountain climb, not a boring checklist." },
                            { icon: <Trophy size={32} />, title: "Dopamine Hits", desc: "Micro-celebrations and avatar nudges reward every step you take." },
                            { icon: <Share2 size={32} />, title: "Share the Journey", desc: "Export stunning visuals of your progress to inspire others on X." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/50 transition-colors group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-blue rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-brand-gold group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
