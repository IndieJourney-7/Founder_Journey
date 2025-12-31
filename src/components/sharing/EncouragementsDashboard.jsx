import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    MessageCircle,
    Users,
    TrendingUp,
    Bell,
    Check,
    ChevronRight,
    X,
    Sparkles
} from 'lucide-react'
import { useMountain } from '../../context/MountainContext'
import {
    getEncouragementSummary,
    markEncouragementRead,
    ENCOURAGEMENT_EMOJIS
} from '../../lib/publicProfileService'

// Format relative time
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

// Single encouragement card
const EncouragementCard = ({ encouragement, onMarkRead }) => {
    const emojiData = ENCOURAGEMENT_EMOJIS[encouragement.emoji] || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border transition-all ${
                encouragement.is_read
                    ? 'bg-white/5 border-white/5'
                    : 'bg-brand-gold/5 border-brand-gold/20'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${emojiData.color}20` }}
                >
                    {emojiData.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                            {encouragement.sender_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-white/40">
                            {formatTimeAgo(encouragement.created_at)}
                        </span>
                        {!encouragement.is_read && (
                            <span className="px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold text-[10px] font-bold rounded">
                                NEW
                            </span>
                        )}
                    </div>
                    {encouragement.message ? (
                        <p className="text-white/70 text-sm mt-1">{encouragement.message}</p>
                    ) : (
                        <p className="text-white/40 text-sm mt-1 italic">
                            Sent a {emojiData.label || 'reaction'}
                        </p>
                    )}
                </div>
                {!encouragement.is_read && onMarkRead && (
                    <button
                        onClick={() => onMarkRead(encouragement.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Mark as read"
                    >
                        <Check className="w-4 h-4 text-white/40" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Stats card
const StatCard = ({ icon: Icon, label, value, color = 'brand-teal' }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}/20`}>
                <Icon className={`w-5 h-5 text-${color}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50">{label}</p>
            </div>
        </div>
    </div>
);

// Modal wrapper
export default function EncouragementsDashboard({ isOpen, onClose }) {
    const { currentMountain } = useMountain();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'messages'

    // Load summary data
    useEffect(() => {
        const loadSummary = async () => {
            if (!isOpen || !currentMountain?.id) return;

            setLoading(true);
            const result = await getEncouragementSummary(currentMountain.id);

            if (!result.error) {
                setSummary(result.summary);
            }
            setLoading(false);
        };

        loadSummary();
    }, [isOpen, currentMountain?.id]);

    // Handle mark as read
    const handleMarkRead = async (encouragementId) => {
        if (!currentMountain?.id) return;

        const result = await markEncouragementRead(currentMountain.id, [encouragementId]);

        if (result.success) {
            setSummary(prev => ({
                ...prev,
                unread: prev.unread - 1,
                allEncouragements: prev.allEncouragements.map(e =>
                    e.id === encouragementId ? { ...e, is_read: true } : e
                )
            }));
        }
    };

    // Handle mark all as read
    const handleMarkAllRead = async () => {
        if (!currentMountain?.id || !summary?.unread) return;

        const result = await markEncouragementRead(currentMountain.id);

        if (result.success) {
            setSummary(prev => ({
                ...prev,
                unread: 0,
                allEncouragements: prev.allEncouragements.map(e => ({ ...e, is_read: true }))
            }));
        }
    };

    // Filter encouragements
    const filteredEncouragements = summary?.allEncouragements?.filter(e => {
        if (filter === 'unread') return !e.is_read;
        if (filter === 'messages') return e.message;
        return true;
    }) || [];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl max-h-[85vh] bg-[#0F1F3D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-xl">
                                <Heart className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Encouragements</h2>
                                <p className="text-sm text-white/50">Cheers from your supporters</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Sparkles className="w-8 h-8 text-brand-gold" />
                            </motion.div>
                        </div>
                    ) : !summary || summary.total === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Heart className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-lg font-semibold text-white/80 mb-2">No encouragements yet</h3>
                            <p className="text-white/50 text-sm max-w-sm">
                                Share your profile to start receiving encouragement from supporters!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-white/10">
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                                    <p className="text-xs text-white/50">Total</p>
                                </div>
                                <div className="bg-brand-gold/10 rounded-xl p-3 text-center border border-brand-gold/20">
                                    <p className="text-2xl font-bold text-brand-gold">{summary.unread}</p>
                                    <p className="text-xs text-white/50">Unread</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-white">{summary.withMessages}</p>
                                    <p className="text-xs text-white/50">With Messages</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-white">{summary.topSupporters?.length || 0}</p>
                                    <p className="text-xs text-white/50">Supporters</p>
                                </div>
                            </div>

                            {/* Emoji Breakdown */}
                            {Object.keys(summary.emojiBreakdown || {}).length > 0 && (
                                <div className="px-6 py-4 border-b border-white/10">
                                    <p className="text-xs text-white/50 mb-2">Reaction breakdown</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(summary.emojiBreakdown)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([emoji, count]) => (
                                                <div
                                                    key={emoji}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full"
                                                >
                                                    <span className="text-lg">{ENCOURAGEMENT_EMOJIS[emoji]?.emoji}</span>
                                                    <span className="text-sm font-medium text-white">{count}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Filter & Actions */}
                            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'unread', label: 'Unread' },
                                        { key: 'messages', label: 'Messages' }
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                filter === key
                                                    ? 'bg-white/15 text-white'
                                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {summary.unread > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
                                    >
                                        <Check className="w-3 h-3" />
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Encouragements List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {filteredEncouragements.length === 0 ? (
                                    <div className="text-center py-8 text-white/40">
                                        No {filter === 'all' ? 'encouragements' : filter} to show
                                    </div>
                                ) : (
                                    filteredEncouragements.map((encouragement, index) => (
                                        <EncouragementCard
                                            key={encouragement.id}
                                            encouragement={encouragement}
                                            onMarkRead={handleMarkRead}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Mini widget for dashboard
export function EncouragementWidget({ onClick }) {
    const { currentMountain } = useMountain();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const loadSummary = async () => {
            if (!currentMountain?.id || !currentMountain?.is_public) return;

            const result = await getEncouragementSummary(currentMountain.id);
            if (!result.error) {
                setSummary(result.summary);
            }
        };

        loadSummary();
    }, [currentMountain?.id, currentMountain?.is_public]);

    if (!currentMountain?.is_public || !summary) return null;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl text-left transition-colors hover:border-red-500/40"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Heart className="w-6 h-6 text-red-400" />
                        {summary.unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-brand-blue text-[10px] font-bold rounded-full flex items-center justify-center">
                                {summary.unread > 9 ? '9+' : summary.unread}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-white">Encouragements</p>
                        <p className="text-xs text-white/50">
                            {summary.total} received
                            {summary.unread > 0 && ` (${summary.unread} new)`}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
            </div>

            {/* Recent emoji preview */}
            {summary.total > 0 && (
                <div className="flex gap-1 mt-3">
                    {Object.entries(summary.emojiBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([emoji]) => (
                            <span key={emoji} className="text-lg opacity-60">
                                {ENCOURAGEMENT_EMOJIS[emoji]?.emoji}
                            </span>
                        ))}
                </div>
            )}
        </motion.button>
    );
}
