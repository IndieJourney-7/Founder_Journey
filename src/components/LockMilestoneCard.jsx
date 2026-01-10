import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Gift, Target, Flame, Check, X, Edit2, ChevronRight } from 'lucide-react'
import { useMountain } from '../context/MountainContext'

/**
 * LockMilestoneCard Component
 *
 * Displays the current locked milestone with:
 * - Target and progress
 * - Commitment message
 * - Reward preview
 * - Streak stats
 */
export default function LockMilestoneCard({ onEdit, onUpdateProgress }) {
    const {
        currentMountain,
        currentMilestone,
        milestones,
        getCurrentMilestoneStreak,
        hasMetricProgress
    } = useMountain()

    const [showAllMilestones, setShowAllMilestones] = useState(false)

    // Format value with prefix/suffix
    const formatValue = (value) => {
        if (value === null || value === undefined) return '0'
        const prefix = currentMountain?.metric_prefix || ''
        const suffix = currentMountain?.metric_suffix || ''
        const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
        return `${prefix}${formatted}${suffix ? ' ' + suffix : ''}`
    }

    // Get streak for current milestone
    const streak = useMemo(() => {
        if (!currentMilestone) return null
        return getCurrentMilestoneStreak(currentMilestone.id)
    }, [currentMilestone, getCurrentMilestoneStreak])

    // Calculate progress to next milestone
    const progressToNext = useMemo(() => {
        if (!currentMilestone || !hasMetricProgress) return 0
        const current = currentMountain?.current_value || 0
        const target = currentMilestone.target_value

        // Find previous milestone
        const sortedMilestones = [...milestones].sort((a, b) => a.target_value - b.target_value)
        const currentIndex = sortedMilestones.findIndex(m => m.id === currentMilestone.id)
        const prevMilestone = currentIndex > 0 ? sortedMilestones[currentIndex - 1] : null
        const prevValue = prevMilestone?.target_value || 0

        // Calculate progress between prev and current milestone
        const range = target - prevValue
        const progress = current - prevValue
        return range > 0 ? Math.min((progress / range) * 100, 100) : 0
    }, [currentMilestone, currentMountain, milestones, hasMetricProgress])

    // Sorted milestones
    const sortedMilestones = useMemo(() => {
        return [...milestones].sort((a, b) => a.target_value - b.target_value)
    }, [milestones])

    const unlockedCount = milestones.filter(m => m.is_unlocked).length

    if (!currentMilestone && milestones.length === 0) {
        return (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6 text-center">
                <Lock size={32} className="mx-auto mb-3 text-white/30" />
                <h3 className="font-bold text-white/50 mb-1">No Milestones Set</h3>
                <p className="text-sm text-white/30">Add milestones to lock in your commitments</p>
            </div>
        )
    }

    // All milestones unlocked!
    if (!currentMilestone && milestones.length > 0) {
        return (
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-brand-gold/20 to-green-500/10 rounded-2xl border-2 border-brand-gold/50 p-6 text-center"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-5xl mb-3"
                >
                    🏆
                </motion.div>
                <h3 className="text-xl font-bold text-brand-gold mb-1">Journey Complete!</h3>
                <p className="text-white/60">You've unlocked all {milestones.length} milestones</p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Current Lock Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-br from-[#1a2a4a] to-[#0f1f3d] rounded-2xl border border-white/10 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-gold/20 to-transparent px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-brand-gold" />
                        <span className="font-medium text-brand-gold">Current Lock</span>
                    </div>
                    <span className="text-xs text-white/50">
                        {unlockedCount}/{milestones.length} unlocked
                    </span>
                </div>

                {/* Main Content */}
                <div className="p-5">
                    {/* Milestone Info */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-2xl flex-shrink-0">
                            {currentMilestone.icon_emoji || '🎯'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white truncate">
                                {currentMilestone.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-brand-gold font-medium">
                                    {formatValue(currentMilestone.target_value)}
                                </span>
                                <span className="text-white/40">target</span>
                            </div>
                        </div>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(currentMilestone)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Edit2 size={16} className="text-white/40" />
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                            <span>Progress to unlock</span>
                            <span>{Math.round(progressToNext)}%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-white/60">
                                {formatValue(currentMountain?.current_value || 0)}
                            </span>
                            <span className="text-brand-gold">
                                {formatValue(currentMilestone.target_value)}
                            </span>
                        </div>
                    </div>

                    {/* Commitment */}
                    {currentMilestone.commitment && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                                <Lock size={14} />
                                My Commitment
                            </div>
                            <p className="text-white/80 text-sm">
                                {currentMilestone.commitment}
                            </p>
                        </div>
                    )}

                    {/* Reward */}
                    {currentMilestone.reward && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                                <Gift size={14} />
                                When I Unlock
                            </div>
                            <p className="text-white/80 text-sm">
                                {currentMilestone.reward}
                            </p>
                        </div>
                    )}

                    {/* Streak Stats */}
                    {streak && streak.total_days > 0 && (
                        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Flame size={18} className="text-orange-400" />
                                <span className="text-white font-medium">
                                    {streak.current_streak} day streak
                                </span>
                                {streak.slip_days > 0 && (
                                    <span className="text-white/40 text-xs">
                                        ({streak.slip_days} slip{streak.slip_days > 1 ? 's' : ''})
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-brand-gold font-bold">{streak.commitment_rate}%</span>
                                <span className="text-white/40 text-xs ml-1">kept</span>
                            </div>
                        </div>
                    )}

                    {/* Update Progress Button */}
                    {onUpdateProgress && (
                        <button
                            onClick={onUpdateProgress}
                            className="w-full mt-4 py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Target size={18} />
                            Update Progress
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Milestone Progress Indicator */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <button
                    onClick={() => setShowAllMilestones(!showAllMilestones)}
                    className="w-full flex items-center justify-between"
                >
                    <span className="text-sm font-medium text-white/70">All Milestones</span>
                    <ChevronRight
                        size={16}
                        className={`text-white/40 transition-transform ${showAllMilestones ? 'rotate-90' : ''}`}
                    />
                </button>

                {/* Mini milestone indicators (always visible) */}
                <div className="flex gap-2 mt-3">
                    {sortedMilestones.map((m) => (
                        <div
                            key={m.id}
                            className={`flex-1 h-2 rounded-full transition-all ${
                                m.is_unlocked
                                    ? 'bg-brand-gold'
                                    : m.id === currentMilestone?.id
                                        ? 'bg-brand-gold/40 animate-pulse'
                                        : 'bg-white/10'
                            }`}
                            title={m.title}
                        />
                    ))}
                </div>

                {/* Expanded milestone list */}
                <AnimatePresence>
                    {showAllMilestones && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2 mt-4">
                                {sortedMilestones.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${
                                            m.is_unlocked
                                                ? 'bg-brand-gold/10'
                                                : m.id === currentMilestone?.id
                                                    ? 'bg-white/10 border border-brand-gold/30'
                                                    : 'bg-white/5'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            m.is_unlocked
                                                ? 'bg-brand-gold text-brand-blue'
                                                : 'bg-white/10 text-white/50'
                                        }`}>
                                            {m.is_unlocked ? <Check size={16} /> : <Lock size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${
                                                m.is_unlocked ? 'text-brand-gold' : 'text-white'
                                            }`}>
                                                {m.icon_emoji} {m.title}
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {formatValue(m.target_value)}
                                            </div>
                                        </div>
                                        {m.is_unlocked && m.unlocked_at && (
                                            <span className="text-xs text-white/30">
                                                {new Date(m.unlocked_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

/**
 * Milestone Unlock Celebration
 */
export function MilestoneUnlockCelebration({ milestone, onClose, onShare }) {
    if (!milestone) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-full max-w-md bg-gradient-to-br from-brand-gold/30 to-brand-blue border-2 border-brand-gold rounded-3xl shadow-2xl p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Confetti effect placeholder */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-7xl mb-4"
                >
                    🎉
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-brand-gold mb-2"
                >
                    Milestone Unlocked!
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <div className="text-5xl my-6">{milestone.icon_emoji || '🏆'}</div>
                    <h3 className="text-2xl font-bold text-white">{milestone.title}</h3>

                    {milestone.commitment && (
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-300 text-sm">
                            <span className="line-through opacity-60">🔒 {milestone.commitment}</span>
                            <div className="mt-1 font-medium">✅ Commitment complete!</div>
                        </div>
                    )}

                    {milestone.reward && (
                        <div className="p-3 bg-brand-gold/20 rounded-xl text-brand-gold text-sm">
                            🎁 Time to: {milestone.reward}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex gap-3"
                >
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="flex-1 py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                        >
                            Share This Win 🚀
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Continue
                    </button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
