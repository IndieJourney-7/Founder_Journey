import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Shield, Sparkles, ArrowRight, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Pricing() {
    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0F1F3D]">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-blue/50 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="text-center max-w-3xl mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-3 sm:px-4 py-1 rounded-full bg-white/5 border border-white/10 text-brand-gold text-xs sm:text-sm font-bold mb-4 sm:mb-6"
                    >
                        Simple, Honest Pricing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight"
                    >
                        Start Small, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-500">
                            Scale When Ready.
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-white/60 px-4"
                    >
                        Choose the plan that fits your journey. Start free, upgrade as you grow.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mb-16 sm:mb-24">
                    {/* Free - Build Everything */}
                    <PricingCard
                        title="Free Forever"
                        price="$0"
                        period="no credit card"
                        description="Build your entire journey. No limits on creating."
                        features={[
                            "✅ Unlimited steps & milestones",
                            "✅ Unlimited notes & reflections",
                            "✅ Full mountain visualization",
                            "✅ 3 product images",
                            "✅ Lessons trail gallery",
                            "📤 3 shares/month (with watermark)",
                            "🎨 Basic theme"
                        ]}
                        buttonText="Start Building Free"
                        buttonLink="/dashboard"
                        isPro={false}
                        delay={0.3}
                    />

                    {/* Pro - Share Everything */}
                    <PricingCard
                        title="Summit Pro"
                        price="$7"
                        period="per month"
                        description="Share your journey everywhere. Stand out as a founder."
                        features={[
                            "Everything in Free, plus:",
                            "📤 Unlimited sharing",
                            "✨ No watermark on exports",
                            "🔗 Public profile URL",
                            "📊 Viral tweet templates",
                            "🖼️ HD quality exports",
                            "🎨 All premium themes",
                            "⚡ Priority support"
                        ]}
                        buttonText="Join Pro Waitlist"
                        isPro={true}
                        isWaitlist={true}
                        delay={0.4}
                        mostPopular={true}
                    />
                </div>

                {/* Value Proposition */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center max-w-2xl mb-16"
                >
                    <div className="bg-gradient-to-r from-brand-gold/10 to-brand-teal/10 border border-white/10 rounded-2xl p-6 sm:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Why This Pricing?</h3>
                        <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                            We believe in <span className="text-brand-gold font-semibold">building first, paying later</span>.
                            Create your entire founder journey for free. When you're ready to share your wins
                            with the world and build your audience, upgrade to Pro.
                        </p>
                    </div>
                </motion.div>

                {/* Waitlist Section (Restored) */}
                <WaitlistSection />

            </div>
        </div>
    )
}

// DODO PAYMENTS - TEST MODE
const DODO_PAYMENT_LINK = 'https://test.checkout.dodopayments.com/buy/pdt_kbHpZ9UEYWvoGANoe2imB?quantity=1&redirect_url=https://sfht-ascent.vercel.app/payment-success&cancel_url=https://sfht-ascent.vercel.app/payment-cancel'

function PricingCard({ title, price, period, description, features, buttonText, buttonLink, isPro, isWaitlist, delay, mostPopular, isUltimate }) {
    const { user } = useAuth()
    const navigate = useNavigate()

    const scrollToWaitlist = () => {
        document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    // Payments disabled - always scroll to waitlist
    const handleButtonClick = () => {
        if (isWaitlist) {
            // Always scroll to waitlist form (payment disabled for now)
            scrollToWaitlist()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className={`
                relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border flex flex-col
                ${isUltimate
                    ? 'bg-gradient-to-br from-purple-900/20 to-[#0F1F3D] border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.15)]'
                    : isPro
                    ? 'bg-[#0F1F3D] border-brand-gold/30 shadow-[0_0_40px_rgba(234,179,8,0.1)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 transition-colors'
                }
            `}
        >
            {mostPopular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full bg-brand-gold text-brand-blue text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                    Most Popular
                </div>
            )}

            {isUltimate && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                    🚀 Best Value
                </div>
            )}

            <div className="mb-6 sm:mb-8">
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isUltimate ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : isPro ? 'text-brand-gold' : 'text-white'}`}>{title}</h3>
                <div className="flex items-baseline gap-1 mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{price}</span>
                    <span className="text-white/50 text-xs sm:text-sm font-medium">{period}</span>
                </div>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{description}</p>
            </div>

            <div className="flex-1 space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <div className={`mt-0.5 sm:mt-1 p-0.5 rounded-full flex-shrink-0 ${isPro ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/10 text-white/50'}`}>
                            <Check size={12} />
                        </div>
                        <span className="text-white/80 text-xs sm:text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            {isWaitlist ? ( // Pro Card Logic
                <button
                    onClick={handleButtonClick}
                    className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold shadow-lg hover:shadow-brand-gold/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {buttonText}
                </button>
            ) : (
                <Link
                    to={buttonLink}
                    className="w-full py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 transition-all flex items-center justify-center text-sm sm:text-base"
                >
                    {buttonText}
                </Link>
            )}
        </motion.div>
    )
}

function WaitlistSection() {
    const [email, setEmail] = useState('')
    const [feedback, setFeedback] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')
        setErrorMessage('')

        try {
            const { error } = await supabase
                .from('pro_waitlist')
                .insert([{
                    email,
                    feedback: feedback || null
                }])

            if (error) {
                // Check for unique violation (code 23505)
                if (error.code === '23505') {
                    setErrorMessage("You're already on the waitlist.")
                } else {
                    setErrorMessage("Something went wrong. Please try again.")
                }
                throw error
            }

            setStatus('success')
            setEmail('')
            setFeedback('')
        } catch (error) {
            console.error('Waitlist error:', error)
            setStatus('error')
        }
    }

    return (
        <motion.div
            id="waitlist-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-2xl text-center py-8 sm:py-12 border-t border-white/10 px-4"
        >
            <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-2.5 sm:p-3 bg-brand-teal/10 rounded-full text-brand-teal">
                    <Shield size={28} className="sm:w-8 sm:h-8" />
                </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Early Beta Access</h2>
            <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8 max-w-lg mx-auto px-2">
                We're building Pro features right now. Join the waitlist to get early access and shape the future of SHIFT Ascent. No credit card required.
            </p>

            {status === 'success' ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-brand-teal/10 border border-brand-teal/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl inline-flex flex-col items-center gap-2 text-brand-teal text-center"
                >
                    <div className="flex items-center gap-2">
                        <Check size={20} className="sm:w-6 sm:h-6" />
                        <p className="font-bold text-base sm:text-lg">You're on the list!</p>
                    </div>
                    <p className="opacity-80 text-sm sm:text-base">You'll be notified when Pro launches.</p>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@startup.com"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-gold focus:outline-none transition-colors text-sm sm:text-base"
                        required
                    />
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What would make Pro worth it for you? (Optional)"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-gold focus:outline-none transition-colors min-h-[70px] sm:min-h-[80px] resize-none text-sm sm:text-base"
                    />

                    {status === 'error' && errorMessage && (
                        <div className="text-red-400 text-xs sm:text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white text-brand-blue font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                    >
                        {status === 'loading' ? <Loader size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" /> : 'Join Pro Waitlist'}
                        {status !== 'loading' && <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    </button>
                </form>
            )}

            <p className="text-white/30 text-[10px] sm:text-xs mt-4 sm:mt-6">
                We respect your inbox. No spam, ever.
            </p>
        </motion.div>
    )
}
