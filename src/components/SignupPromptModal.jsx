import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Zap, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * SignupPromptModal
 *
 * Beautiful modal that prompts demo users to sign up
 * Triggered when they try to share, download, or hit step limit
 */

const PROMPT_TYPES = {
    share: {
        icon: <Rocket size={48} className="text-brand-gold" />,
        title: "Share Your Journey!",
        subtitle: "Sign up free to share your progress with the world",
        features: [
            "📥 Download unlimited banners",
            "🔗 Share directly to X & LinkedIn",
            "💾 Save your progress permanently",
            "🎨 Access all themes & formats"
        ],
        cta: "Sign Up to Share"
    },
    download: {
        icon: <Zap size={48} className="text-brand-gold" />,
        title: "Save Your Banner!",
        subtitle: "Create a free account to download your progress",
        features: [
            "📥 Download unlimited HD banners",
            "🎨 6 beautiful themes",
            "📱 4 social media formats",
            "💾 Keep all your data safe"
        ],
        cta: "Sign Up to Download"
    },
    stepLimit: {
        icon: <TrendingUp size={48} className="text-brand-gold" />,
        title: "Unlock Unlimited Steps!",
        subtitle: "You've reached the demo limit. Create a free account to continue",
        features: [
            "♾️ Unlimited steps",
            "📊 Full progress tracking",
            "💾 Save across devices",
            "🎯 Complete your journey"
        ],
        cta: "Sign Up Free"
    },
    lessons: {
        icon: <Users size={48} className="text-brand-gold" />,
        title: "Save Your Wisdom!",
        subtitle: "Sign up to access your full lessons trail",
        features: [
            "📚 Unlimited lessons",
            "🔖 Organize by step",
            "🔗 Share lesson cards",
            "💡 Build your wisdom library"
        ],
        cta: "Create Free Account"
    }
};

export default function SignupPromptModal({ isOpen, onClose, promptType = 'share' }) {
    const navigate = useNavigate();
    const config = PROMPT_TYPES[promptType] || PROMPT_TYPES.share;

    const handleSignup = () => {
        onClose();
        navigate('/auth?mode=signup&from=demo');
    };

    const handleLogin = () => {
        onClose();
        navigate('/auth?mode=login');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-gradient-to-br from-[#0F1F3D] to-[#1a2744] border-2 border-brand-gold/30 rounded-2xl p-8 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            {config.icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-center text-white mb-3">
                            {config.title}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-center text-white/70 mb-8 text-lg">
                            {config.subtitle}
                        </p>

                        {/* Features */}
                        <div className="space-y-3 mb-8 bg-white/5 rounded-xl p-6 border border-white/10">
                            {config.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-white/90">
                                    <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-brand-gold text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleSignup}
                                className="w-full py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold rounded-lg hover:shadow-lg hover:shadow-brand-gold/50 transition-all transform hover:scale-105 text-lg"
                            >
                                {config.cta} →
                            </button>

                            <button
                                onClick={handleLogin}
                                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                            >
                                Already have an account? Log in
                            </button>
                        </div>

                        {/* Trust Badge */}
                        <p className="text-center text-white/40 text-xs mt-6">
                            🔒 Free forever • No credit card required • Takes 30 seconds
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
