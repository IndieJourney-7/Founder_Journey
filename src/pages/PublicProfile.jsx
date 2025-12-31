import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mountain,
    Target,
    Trophy,
    CheckCircle2,
    XCircle,
    Clock,
    Send,
    Heart,
    Share2,
    ExternalLink,
    User,
    Sparkles,
    ArrowLeft,
    BookOpen,
    TrendingUp,
    X
} from 'lucide-react'
import {
    fetchPublicMountain,
    sendEncouragement,
    fetchEncouragements,
    ENCOURAGEMENT_EMOJIS
} from '../lib/publicProfileService'
import MountainBackground from '../components/mountain/MountainBackground'
import SEO, { getPublicProfileSEO } from '../components/SEO'

// Encouragement Reaction Button
const EmojiButton = ({ emojiKey, onClick, disabled, count = 0, selected = false }) => {
    const { emoji, label, color } = ENCOURAGEMENT_EMOJIS[emojiKey];

    return (
        <motion.button
            onClick={() => onClick(emojiKey)}
            disabled={disabled}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                disabled
                    ? 'opacity-50 cursor-not-allowed bg-white/5'
                    : selected
                        ? 'bg-white/20 ring-2 ring-white/40'
                        : 'bg-white/5 hover:bg-white/15 cursor-pointer'
            }`}
            style={{ '--emoji-color': color }}
        >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs text-white/60">{label}</span>
            {count > 0 && (
                <span className="text-xs font-bold" style={{ color }}>{count}</span>
            )}
        </motion.button>
    );
};

// Cheer Message Form
const CheerMessageForm = ({ selectedEmoji, onSend, onCancel, sending }) => {
    const [senderName, setSenderName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(senderName.trim() || null, message.trim() || null);
    };

    const emojiData = ENCOURAGEMENT_EMOJIS[selectedEmoji];

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="mt-4 p-4 bg-black/30 rounded-xl border border-white/10 space-y-3"
        >
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{emojiData?.emoji}</span>
                <div>
                    <p className="text-white font-medium">Add a personal touch</p>
                    <p className="text-xs text-white/50">Optional: Include your name and message</p>
                </div>
            </div>

            <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={50}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
            />

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a short message of encouragement... (optional)"
                maxLength={140}
                rows={2}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">{message.length}/140</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={sending}
                        className="px-6 py-2 bg-gradient-to-r from-brand-teal to-brand-gold text-brand-blue font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : 'Send Cheer'}
                    </button>
                </div>
            </div>
        </motion.form>
    );
};

// Step Card for public view
const PublicStepCard = ({ step, notes, index }) => {
    const statusColors = {
        'success': 'border-green-500/30 bg-green-500/10',
        'failed': 'border-red-500/30 bg-red-500/10',
        'in-progress': 'border-brand-teal/30 bg-brand-teal/10',
        'pending': 'border-white/10 bg-white/5'
    };

    const statusIcons = {
        'success': <CheckCircle2 className="w-5 h-5 text-green-500" />,
        'failed': <XCircle className="w-5 h-5 text-red-500" />,
        'in-progress': <TrendingUp className="w-5 h-5 text-brand-teal" />,
        'pending': <Clock className="w-5 h-5 text-white/40" />
    };

    const stepNotes = notes.filter(n => n.step_id === step.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${statusColors[step.status]} relative overflow-hidden`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-1">{statusIcons[step.status]}</div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{step.title}</h4>
                    {step.description && (
                        <p className="text-sm text-white/60 mt-1 line-clamp-2">{step.description}</p>
                    )}
                    {stepNotes.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-brand-purple">
                            <BookOpen className="w-3 h-3" />
                            <span>{stepNotes.length} reflection{stepNotes.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
                <div className="text-sm font-mono text-white/30">#{index + 1}</div>
            </div>
        </motion.div>
    );
};

// Encouragement sent animation
const EncouragementSent = ({ emoji, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
                className="text-8xl"
            >
                {ENCOURAGEMENT_EMOJIS[emoji]?.emoji}
            </motion.div>
        </motion.div>
    );
};

// Share Modal
const ShareModal = ({ username, mountainTitle, onClose }) => {
    const shareUrl = `${window.location.origin}/climb/@${username}`;
    const tweetText = `Check out my journey: "${mountainTitle}" on SHIFT ASCENT! 🏔️\n\n${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
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
                className="w-full max-w-md bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-brand-teal" />
                        Share Journey
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* URL Copy */}
                    <div>
                        <label className="text-sm text-white/60 mb-2 block">Share Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white/80 text-sm"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-brand-teal text-brand-blue hover:bg-brand-teal/80'
                                }`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Share to X */}
                    <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-black hover:bg-black/80 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share on X
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function PublicProfile() {
    const { username } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mountain, setMountain] = useState(null);
    const [steps, setSteps] = useState([]);
    const [notes, setNotes] = useState([]);
    const [encouragements, setEncouragements] = useState([]);
    const [sentEmoji, setSentEmoji] = useState(null);
    const [sending, setSending] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const [showCheerForm, setShowCheerForm] = useState(false);

    // Clean username (remove @ if present)
    const cleanUsername = username?.replace('@', '');

    // Load public profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (!cleanUsername) {
                setError('Invalid username');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const result = await fetchPublicMountain(cleanUsername);

            if (result.error) {
                setError(result.error);
            } else {
                setMountain(result.mountain);
                setSteps(result.steps || []);
                setNotes(result.notes || []);
            }

            // Also load encouragements
            if (result.mountain) {
                const encResult = await fetchEncouragements(result.mountain.id);
                if (!encResult.error) {
                    setEncouragements(encResult.encouragements || []);
                }
            }

            setLoading(false);
        };

        loadProfile();
    }, [cleanUsername]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!mountain || !steps) return null;

        const successfulSteps = steps.filter(s => s.status === 'success').length;
        const resolvedSteps = steps.filter(s => s.status === 'success' || s.status === 'failed').length;
        const totalPlanned = mountain.total_steps_planned || 6;

        // Progress calculation
        let progress = 0;
        if (mountain.target_value && mountain.target_value > 0) {
            progress = Math.min(100, (mountain.current_value / mountain.target_value) * 100);
        } else if (totalPlanned > 0) {
            progress = Math.min(100, (successfulSteps / totalPlanned) * 100);
        }

        return { successfulSteps, resolvedSteps, totalPlanned, progress };
    }, [mountain, steps]);

    // Count encouragements by type
    const emojiCounts = useMemo(() => {
        const counts = {};
        encouragements.forEach(e => {
            counts[e.emoji] = (counts[e.emoji] || 0) + 1;
        });
        return counts;
    }, [encouragements]);

    // Handle emoji selection (first click shows form, second click quick sends)
    const handleEmojiClick = (emoji) => {
        if (sending || cooldown || !mountain) return;

        if (selectedEmoji === emoji && showCheerForm) {
            // If same emoji clicked again while form is open, quick send
            handleSendCheer(null, null);
        } else {
            // Show the cheer form with this emoji selected
            setSelectedEmoji(emoji);
            setShowCheerForm(true);
        }
    };

    // Handle sending encouragement with optional name/message
    const handleSendCheer = async (senderName, message) => {
        if (sending || !mountain || !selectedEmoji) return;

        setSending(true);
        const result = await sendEncouragement(mountain.id, selectedEmoji, senderName, message);

        if (result.success) {
            setSentEmoji(selectedEmoji);
            setEncouragements(prev => [{
                id: Date.now(),
                emoji: selectedEmoji,
                sender_name: senderName,
                message: message,
                created_at: new Date().toISOString()
            }, ...prev]);

            // Reset form
            setShowCheerForm(false);
            setSelectedEmoji(null);

            // Cooldown to prevent spam
            setCooldown(true);
            setTimeout(() => setCooldown(false), 5000);
        }

        setSending(false);
    };

    // Cancel cheer form
    const handleCancelCheer = () => {
        setShowCheerForm(false);
        setSelectedEmoji(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Mountain className="w-12 h-12 text-brand-gold" />
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                        <Mountain className="w-12 h-12 text-white/30" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p className="text-white/60 mb-6">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    // Generate SEO props
    const seoProps = mountain ? getPublicProfileSEO({
        username: cleanUsername,
        title: mountain.title,
        target: mountain.target,
        progress: stats?.progress,
        bio: mountain.public_bio,
        encouragementCount: mountain.encouragement_count
    }) : null;

    return (
        <div className="min-h-screen bg-brand-blue relative overflow-hidden">
            {/* Dynamic SEO Meta Tags */}
            {seoProps && <SEO {...seoProps} />}

            {/* Mountain Background */}
            <div className="absolute inset-0 pointer-events-none">
                <MountainBackground progress={stats?.progress || 0} height="100vh" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="p-4 border-b border-white/10 backdrop-blur-sm bg-brand-blue/60">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link
                            to="/"
                            className="text-xl font-bold text-brand-gold tracking-tighter flex items-center gap-2"
                        >
                            <Mountain className="w-6 h-6" />
                            SHIFT ASCENT
                        </Link>
                        <button
                            onClick={() => setShowShare(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>
                </header>

                {/* Profile Content */}
                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-brand-blue text-2xl font-bold shadow-lg shadow-brand-gold/30">
                            {cleanUsername?.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="text-xl font-bold text-white/60">@{cleanUsername}</h1>
                        {mountain.public_bio && (
                            <p className="text-white/50 mt-2 max-w-md mx-auto">{mountain.public_bio}</p>
                        )}
                    </motion.div>

                    {/* Mountain Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0F1F3D]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-brand-gold/20 rounded-xl">
                                <Mountain className="w-8 h-8 text-brand-gold" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">{mountain.title}</h2>
                                <div className="flex items-center gap-2 text-white/60">
                                    <Target className="w-4 h-4" />
                                    <span>{mountain.target}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-black/30 rounded-xl p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white/70">Journey Progress</span>
                                <span className="font-bold text-brand-teal">{Math.round(stats?.progress || 0)}%</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.progress || 0}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-brand-teal to-brand-gold"
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-white/40">
                                <span>{stats?.resolvedSteps || 0} steps completed</span>
                                <span>{stats?.totalPlanned || 0} planned</span>
                            </div>
                        </div>

                        {/* Metric Progress (if applicable) */}
                        {mountain.target_value > 0 && (
                            <div className="mt-4 p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60 text-sm">Metric Progress</span>
                                    <span className="font-bold text-brand-gold">
                                        {mountain.metric_prefix}{mountain.current_value || 0}{mountain.metric_suffix}
                                        <span className="text-white/40 font-normal"> / </span>
                                        {mountain.metric_prefix}{mountain.target_value}{mountain.metric_suffix}
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Encouragement Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0F1F3D]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-400" />
                            Send Encouragement
                            {mountain.encouragement_count > 0 && (
                                <span className="ml-auto text-sm font-normal text-white/40">
                                    {mountain.encouragement_count} received
                                </span>
                            )}
                        </h3>

                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {Object.keys(ENCOURAGEMENT_EMOJIS).map(key => (
                                <EmojiButton
                                    key={key}
                                    emojiKey={key}
                                    onClick={handleEmojiClick}
                                    disabled={sending || cooldown}
                                    count={emojiCounts[key]}
                                    selected={selectedEmoji === key}
                                />
                            ))}
                        </div>

                        {/* Cheer Message Form */}
                        <AnimatePresence>
                            {showCheerForm && selectedEmoji && (
                                <CheerMessageForm
                                    selectedEmoji={selectedEmoji}
                                    onSend={handleSendCheer}
                                    onCancel={handleCancelCheer}
                                    sending={sending}
                                />
                            )}
                        </AnimatePresence>

                        {!showCheerForm && !cooldown && (
                            <p className="text-center text-white/30 text-xs mt-3">
                                Click an emoji to add an optional message
                            </p>
                        )}

                        {cooldown && (
                            <p className="text-center text-white/40 text-sm mt-3">
                                Thanks for the encouragement! Wait a moment before sending another.
                            </p>
                        )}
                    </motion.div>

                    {/* Steps List */}
                    {steps.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#0F1F3D]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-gold" />
                                Journey Steps
                            </h3>

                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <PublicStepCard
                                        key={step.id}
                                        step={step}
                                        notes={notes}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mt-8"
                    >
                        <p className="text-white/50 mb-4">Start your own journey</p>
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
                        >
                            <Mountain className="w-5 h-5" />
                            Begin Your Ascent
                        </Link>
                    </motion.div>
                </main>
            </div>

            {/* Sent Animation */}
            <AnimatePresence>
                {sentEmoji && (
                    <EncouragementSent
                        emoji={sentEmoji}
                        onComplete={() => setSentEmoji(null)}
                    />
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShare && (
                    <ShareModal
                        username={cleanUsername}
                        mountainTitle={mountain.title}
                        onClose={() => setShowShare(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
