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

            {/* Features (Existing) */}
            <section className="py-16 sm:py-20 lg:py-24 bg-[#0F1F3D]">
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
