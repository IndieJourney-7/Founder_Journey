import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy,
    Share2,
    X,
    Sparkles,
    Mountain,
    PartyPopper,
    Rocket,
    Star,
    Target,
    Check,
    Copy,
    Download,
    Image
} from 'lucide-react'
import { useMountain } from '../../context/MountainContext'
import { useToast } from '../../context/ToastContext'
import {
    getUnsharedMilestones,
    markMilestoneShared,
    ENCOURAGEMENT_EMOJIS
} from '../../lib/publicProfileService'
import { generateOGImageUrl, BASE_URL } from '../SEO'

// Milestone icons and colors by type
const MILESTONE_CONFIG = {
    '25': {
        icon: Rocket,
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        emoji: '🚀',
        celebration: 'Quarter of the way there!'
    },
    '50': {
        icon: Target,
        color: '#8b5cf6',
        gradient: 'from-purple-500 to-pink-500',
        emoji: '🎯',
        celebration: 'Halfway to the summit!'
    },
    '75': {
        icon: Star,
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-500',
        emoji: '⭐',
        celebration: 'The peak is in sight!'
    },
    '100': {
        icon: Trophy,
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-500',
        emoji: '🏆',
        celebration: 'You reached the summit!'
    },
    'custom': {
        icon: Sparkles,
        color: '#e7c778',
        gradient: 'from-yellow-500 to-amber-500',
        emoji: '✨',
        celebration: 'Milestone achieved!'
    }
};

// Confetti particle component
const ConfettiParticle = ({ delay }) => {
    const colors = ['#E7C778', '#4CD4C0', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
        <motion.div
            initial={{
                opacity: 1,
                y: 0,
                x: Math.random() * 100 - 50,
                rotate: 0,
                scale: 1
            }}
            animate={{
                opacity: 0,
                y: 400,
                x: Math.random() * 200 - 100,
                rotate: Math.random() * 720 - 360,
                scale: 0
            }}
            transition={{
                duration: 2 + Math.random(),
                delay: delay,
                ease: 'easeOut'
            }}
            className="absolute top-0 left-1/2"
            style={{ backgroundColor: color }}
        >
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        </motion.div>
    );
};

// Generate viral share captions
const generateShareCaptions = (milestone, mountain, config) => {
    const milestonePercent = milestone.milestone_type;
    const journeyTitle = mountain?.title || 'my journey';
    const username = mountain?.username || '';

    // Different captions for different milestones
    const captions = {
        '25': [
            `${config.emoji} 25% of the way to "${journeyTitle}"!\n\nThe first quarter is always the hardest. Now the momentum kicks in.\n\n#buildinpublic #startups`,
            `${config.emoji} Quarter of the way there!\n\nBuilding "${journeyTitle}" in public.\n\nSmall wins compound into big results.\n\n#buildinpublic #founderjourney`,
        ],
        '50': [
            `${config.emoji} HALFWAY POINT!\n\n50% of the way to "${journeyTitle}"\n\nThis is where most people quit. Not me.\n\n#buildinpublic #startups #nevergiveup`,
            `${config.emoji} The view from halfway up is incredible.\n\nBuilding "${journeyTitle}" - 50% complete!\n\nKeep climbing. 🏔️\n\n#buildinpublic`,
        ],
        '75': [
            `${config.emoji} 75% TO THE SUMMIT!\n\n"${journeyTitle}" is almost complete.\n\nThe final push. This is where legends are made.\n\n#buildinpublic #startups #almostthere`,
            `${config.emoji} Three quarters done!\n\nI can see the peak from here.\n\n"${journeyTitle}" - 75% complete\n\n#buildinpublic #founderjourney`,
        ],
        '100': [
            `🏆 I DID IT!\n\nReached 100% on "${journeyTitle}"!\n\nMonths of hard work. Countless lessons. One incredible journey.\n\nThank you to everyone who cheered me on!\n\n#buildinpublic #startup #success`,
            `🏆 SUMMIT REACHED!\n\n"${journeyTitle}" - 100% COMPLETE!\n\nFrom Day 1 to the peak. Every step was worth it.\n\nWhat's next? Another mountain. 🏔️\n\n#buildinpublic #founder`,
        ],
    };

    // Pick a random caption for variety
    const options = captions[milestonePercent] || [`${config.emoji} Milestone achieved on "${journeyTitle}"!\n\n#buildinpublic`];
    return options[Math.floor(Math.random() * options.length)];
};

// Single Milestone Card
const MilestoneCard = ({ milestone, onShare, onDismiss, isSharing }) => {
    const config = MILESTONE_CONFIG[milestone.milestone_type] || MILESTONE_CONFIG.custom;
    const Icon = config.icon;
    const [copied, setCopied] = useState(false);
    const [showCaptions, setShowCaptions] = useState(false);

    const { currentMountain } = useMountain();
    const toast = useToast();

    // Generate share content
    const shareCaption = generateShareCaptions(milestone, currentMountain, config);
    const shareUrl = currentMountain?.username
        ? `${BASE_URL}/climb/@${currentMountain.username}`
        : BASE_URL;

    // Generate dynamic OG image URL for this milestone
    const ogImageUrl = generateOGImageUrl({
        username: currentMountain?.username,
        title: currentMountain?.title,
        target: currentMountain?.target,
        progress: parseInt(milestone.milestone_type) || 0,
        type: 'milestone',
        milestone: milestone.milestone_type
    });

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCaption)}&url=${encodeURIComponent(shareUrl)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    // Copy caption to clipboard
    const handleCopyCaption = async () => {
        try {
            await navigator.clipboard.writeText(`${shareCaption}\n\n${shareUrl}`);
            setCopied(true);
            toast.success('Copied!', 'Caption copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy', 'Please try again');
        }
    };

    // Download OG image
    const handleDownloadImage = () => {
        window.open(ogImageUrl, '_blank');
        toast.info('Opening image...', 'Right-click to save the image');
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-[#0F1F3D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
        >
            {/* Header with gradient */}
            <div className={`p-6 bg-gradient-to-r ${config.gradient} relative overflow-hidden`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute -left-5 -bottom-5 w-24 h-24 bg-white/10 rounded-full"
                />

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                        <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-black text-white mb-1"
                    >
                        {milestone.title}
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/80"
                    >
                        {config.celebration}
                    </motion.p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Pre-written caption preview */}
                <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Ready-to-share caption</span>
                        <button
                            onClick={handleCopyCaption}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-line line-clamp-4">
                        {shareCaption}
                    </p>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                    <p className="text-xs text-white/40 text-center">One-click share</p>

                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onShare(milestone.id)}
                            className="flex items-center justify-center gap-2 py-3 bg-black hover:bg-black/80 rounded-xl transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Share on X
                        </a>
                        <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onShare(milestone.id)}
                            className="flex items-center justify-center gap-2 py-3 bg-[#0077B5] hover:bg-[#006699] rounded-xl transition-colors font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </a>
                    </div>

                    {/* Download image button */}
                    <button
                        onClick={handleDownloadImage}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm"
                    >
                        <Image className="w-4 h-4" />
                        Get Shareable Image
                    </button>

                    <button
                        onClick={() => onDismiss(milestone.id)}
                        className="w-full py-3 text-white/40 hover:text-white/60 transition-colors text-sm"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Main Milestone Celebration Modal
export default function MilestoneCelebration({ isOpen, onClose }) {
    const { currentMountain } = useMountain();
    const toast = useToast();
    const [milestones, setMilestones] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    // Load unshared milestones
    useEffect(() => {
        const loadMilestones = async () => {
            if (!isOpen || !currentMountain?.id) return;

            setLoading(true);
            const result = await getUnsharedMilestones(currentMountain.id);

            if (!result.error && result.milestones?.length > 0) {
                setMilestones(result.milestones);
                setCurrentIndex(0);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }
            setLoading(false);
        };

        loadMilestones();
    }, [isOpen, currentMountain?.id]);

    // Handle share
    const handleShare = async (milestoneId) => {
        const result = await markMilestoneShared(milestoneId);

        if (result.success) {
            toast.success('Achievement Shared!', 'Your milestone has been shared');
            handleNext();
        }
    };

    // Handle dismiss
    const handleDismiss = async (milestoneId) => {
        // Mark as shared but don't actually share
        await markMilestoneShared(milestoneId);
        handleNext();
    };

    // Move to next milestone or close
    const handleNext = () => {
        if (currentIndex < milestones.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    const currentMilestone = milestones[currentIndex];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                {/* Confetti */}
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <ConfettiParticle key={i} delay={i * 0.03} />
                        ))}
                    </div>
                )}

                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                        <Sparkles className="w-12 h-12 text-brand-gold" />
                    </motion.div>
                ) : milestones.length === 0 ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center text-white/60"
                        onClick={e => e.stopPropagation()}
                    >
                        <PartyPopper className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <p>No new milestones to celebrate!</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                ) : currentMilestone ? (
                    <div onClick={e => e.stopPropagation()}>
                        {/* Progress indicator */}
                        {milestones.length > 1 && (
                            <div className="flex justify-center gap-2 mb-4">
                                {milestones.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            i === currentIndex ? 'bg-brand-gold' : i < currentIndex ? 'bg-white/40' : 'bg-white/10'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        <MilestoneCard
                            milestone={currentMilestone}
                            onShare={handleShare}
                            onDismiss={handleDismiss}
                        />
                    </div>
                ) : null}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6 text-white/60" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook to check for new milestones
export function useMilestoneCheck() {
    const { currentMountain } = useMountain();
    const [hasUnshared, setHasUnshared] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const checkMilestones = async () => {
            if (!currentMountain?.id) {
                setHasUnshared(false);
                setCount(0);
                return;
            }

            const result = await getUnsharedMilestones(currentMountain.id);

            if (!result.error) {
                setHasUnshared(result.milestones?.length > 0);
                setCount(result.milestones?.length || 0);
            }
        };

        checkMilestones();

        // Check every minute while app is open
        const interval = setInterval(checkMilestones, 60000);
        return () => clearInterval(interval);
    }, [currentMountain?.id, currentMountain?.current_value]);

    return { hasUnshared, count };
}

// Milestone notification badge
export function MilestoneBadge({ onClick }) {
    const { hasUnshared, count } = useMilestoneCheck();

    if (!hasUnshared) return null;

    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold rounded-full shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 transition-shadow"
        >
            <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
                <Trophy className="w-5 h-5" />
            </motion.div>
            <span>New Milestone!</span>
            {count > 1 && (
                <span className="px-2 py-0.5 bg-brand-blue/20 rounded-full text-sm">
                    {count}
                </span>
            )}
        </motion.button>
    );
}
