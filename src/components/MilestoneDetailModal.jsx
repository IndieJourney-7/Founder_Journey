import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Gift, Clock, Target, Flame, AlertTriangle, Check } from 'lucide-react'
import { useMountain } from '../context/MountainContext'
import DailyCheckIn from './DailyCheckIn'
import { getTimeRemaining, formatTimeRemaining, formatDeadline } from '../utils/pathUtils'

/**
 * MilestoneDetailModal Component
 *
 * Full-screen popup showing milestone details:
 * - Progress bar (to this milestone)
 * - Commitment (the promise/lock)
 * - Consequence (what happens if broken)
 * - Reward (what they get when unlocked)
 * - Countdown timer (for deadline-based milestones)
 * - Embedded DailyCheckIn calendar
 *
 * Based on user's mockup with dark glassmorphic design.
 */
export default function MilestoneDetailModal({ isOpen, onClose, milestone }) {
    const {
        currentMountain,
        milestones,
        getCurrentMilestoneStreak,
        hasMetricProgress,
        updateProgressWithMilestones
    } = useMountain()

    const [countdown, setCountdown] = useState(null)

    // Format value with prefix/suffix
    const formatValue = (value) => {
        if (value === null || value === undefined) return '0'
        const prefix = currentMountain?.metric_prefix || ''
        const suffix = currentMountain?.metric_suffix || ''
        const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
        return `${prefix}${formatted}${suffix ? ' ' + suffix : ''}`
    }

    // Get streak for this milestone
    const streak = useMemo(() => {
        if (!milestone) return null
        return getCurrentMilestoneStreak(milestone.id)
    }, [milestone, getCurrentMilestoneStreak])

    // Calculate progress to this milestone
    const progressToMilestone = useMemo(() => {
        if (!milestone || !hasMetricProgress) return 0
        const current = currentMountain?.current_value || 0
        const target = milestone.target_value

        // Find previous milestone
        const sortedMilestones = [...milestones].sort((a, b) => a.target_value - b.target_value)
        const currentIndex = sortedMilestones.findIndex(m => m.id === milestone.id)
        const prevMilestone = currentIndex > 0 ? sortedMilestones[currentIndex - 1] : null
        const prevValue = prevMilestone?.target_value || 0

        // Calculate progress between prev and this milestone
        const range = target - prevValue
        const progress = current - prevValue
        return range > 0 ? Math.min(Math.max((progress / range) * 100, 0), 100) : 0
    }, [milestone, currentMountain, milestones, hasMetricProgress])

    // Countdown timer effect
    useEffect(() => {
        if (!milestone?.deadline || milestone.is_unlocked) {
            setCountdown(null)
            return
        }

        const updateCountdown = () => {
            setCountdown(getTimeRemaining(milestone.deadline))
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [milestone])

    if (!isOpen || !milestone) return null

    const isUnlocked = milestone.is_unlocked
    const isBroken = milestone.is_broken
    const hasDeadline = !!milestone.deadline
    const isExpired = countdown?.isExpired

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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a2a4a] to-[#0a1525] rounded-3xl border border-white/10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gradient-to-b from-[#1a2a4a] to-transparent px-6 pt-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {/* Lock Icon */}
                                <div className={`
                                    w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                                    ${isUnlocked
                                        ? 'bg-gradient-to-br from-brand-gold to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                                        : isBroken
                                            ? 'bg-gradient-to-br from-slate-700 to-slate-900 border border-red-500/50'
                                            : 'bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10'
                                    }
                                `}>
                                    {isUnlocked ? (
                                        milestone.icon_emoji || '🏆'
                                    ) : isBroken ? (
                                        <CrackedLockLarge />
                                    ) : (
                                        <Lock size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {milestone.title || 'Milestone'}
                                    </h2>
                                    <div className={`
                                        inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1
                                        ${isUnlocked
                                            ? 'bg-green-500/20 text-green-400'
                                            : isBroken
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                        }
                                    `}>
                                        {isUnlocked ? 'COMPLETED' : isBroken ? 'PROMISE BROKEN' : 'LOCKED'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 space-y-5">
                        {/* Countdown Timer (for deadline-based) */}
                        {hasDeadline && !isUnlocked && (
                            <div className={`
                                p-5 rounded-2xl border text-center
                                ${isExpired
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-slate-800/50 border-white/10'
                                }
                            `}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Clock size={18} className={isExpired ? 'text-red-400' : 'text-white/60'} />
                                    <span className={`text-sm ${isExpired ? 'text-red-400' : 'text-white/60'}`}>
                                        {isExpired ? 'Deadline Passed' : 'Time Remaining'}
                                    </span>
                                </div>
                                <div className={`
                                    font-mono text-4xl font-bold tracking-wider
                                    ${isExpired ? 'text-red-400' : 'text-white'}
                                `}>
                                    {countdown ? formatTimeRemaining(milestone.deadline) : '--:--:--'}
                                </div>
                                <p className="text-sm text-white/50 mt-2">
                                    Due: {formatDeadline(milestone.deadline)}
                                </p>
                            </div>
                        )}

                        {/* Progress Bar (for value-based) */}
                        {hasMetricProgress && milestone.target_value && !isUnlocked && (
                            <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target size={18} className="text-brand-gold" />
                                    <span className="text-sm text-white/60">Progress to Unlock</span>
                                </div>
                                <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToMilestone}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">
                                        {formatValue(currentMountain?.current_value || 0)}
                                    </span>
                                    <span className="text-brand-gold font-medium">
                                        {formatValue(milestone.target_value)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Promise Statement */}
                        {!isUnlocked && milestone.commitment && (
                            <div className="bg-slate-900/80 rounded-2xl border border-white/5 p-5 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg border border-white/10">
                                        <Lock size={32} className="text-slate-300" />
                                    </div>
                                </div>
                                <p className="text-white/90 text-lg leading-relaxed">
                                    I promise that I will{' '}
                                    <span className="font-bold text-white">
                                        {milestone.title || 'complete this milestone'}
                                    </span>
                                    {hasDeadline && (
                                        <>
                                            {' '}before{' '}
                                            <span className="font-bold text-brand-gold">
                                                {formatDeadline(milestone.deadline)}
                                            </span>
                                        </>
                                    )}
                                    .
                                </p>
                                <p className="text-white/60 mt-2">
                                    If I don't, I accept the consequence.
                                </p>
                            </div>
                        )}

                        {/* Commitment (What I'm giving up) */}
                        {milestone.commitment && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-red-400 mb-3">
                                    <Lock size={18} />
                                    <span className="font-medium">My Commitment</span>
                                </div>
                                <p className="text-white/90 text-lg">
                                    "{milestone.commitment}"
                                </p>
                            </div>
                        )}

                        {/* Consequence (What happens if broken) */}
                        {milestone.consequence && !isUnlocked && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-orange-400 mb-3">
                                    <AlertTriangle size={18} />
                                    <span className="font-medium">If I Break My Promise</span>
                                </div>
                                <p className="text-white/90">
                                    {milestone.consequence}
                                </p>
                            </div>
                        )}

                        {/* Reward */}
                        {milestone.reward && (
                            <div className={`
                                rounded-2xl p-5 border
                                ${isUnlocked
                                    ? 'bg-green-500/20 border-green-500/30'
                                    : 'bg-green-500/10 border-green-500/20'
                                }
                            `}>
                                <div className="flex items-center gap-2 text-green-400 mb-3">
                                    <Gift size={18} />
                                    <span className="font-medium">
                                        {isUnlocked ? 'Your Reward' : 'When I Unlock'}
                                    </span>
                                </div>
                                <p className={`text-lg ${isUnlocked ? 'text-green-300' : 'text-white/90'}`}>
                                    {milestone.reward}
                                </p>
                                {isUnlocked && (
                                    <p className="text-green-400/70 text-sm mt-2">
                                        You earned this! Enjoy it.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Broken Promise Info */}
                        {isBroken && milestone.broken_reason && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-red-400 mb-3">
                                    <AlertTriangle size={18} />
                                    <span className="font-medium">Promise Broken</span>
                                </div>
                                <p className="text-white/70 text-sm mb-2">
                                    Deadline: {milestone.deadline ? formatDeadline(milestone.deadline) : 'Missed'}
                                </p>
                                <p className="text-white/90">
                                    Reason: "{milestone.broken_reason}"
                                </p>
                            </div>
                        )}

                        {/* Streak Stats (for active milestones) */}
                        {!isUnlocked && !isBroken && streak && streak.total_days > 0 && (
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <Flame size={20} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            {streak.current_streak} day streak
                                        </p>
                                        <p className="text-white/50 text-sm">
                                            {streak.kept_days} of {streak.total_days} days kept
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-brand-gold">
                                        {streak.commitment_rate}%
                                    </span>
                                    <p className="text-white/50 text-sm">success</p>
                                </div>
                            </div>
                        )}

                        {/* Daily Check-in Calendar (for non-completed milestones) */}
                        {!isUnlocked && !isBroken && (
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-3 px-1">
                                    Daily Promise Tracker
                                </h3>
                                <DailyCheckIn milestoneId={milestone.id} />
                            </div>
                        )}

                        {/* Completed State */}
                        {isUnlocked && (
                            <div className="bg-gradient-to-br from-brand-gold/20 to-green-500/10 rounded-2xl border border-brand-gold/30 p-6 text-center">
                                <div className="text-5xl mb-3">
                                    {milestone.icon_emoji || '🏆'}
                                </div>
                                <h3 className="text-xl font-bold text-brand-gold mb-1">
                                    Milestone Achieved!
                                </h3>
                                {milestone.unlocked_at && (
                                    <p className="text-white/60 text-sm">
                                        Completed on {new Date(milestone.unlocked_at).toLocaleDateString()}
                                    </p>
                                )}
                                {streak && streak.total_days > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-white/70 text-sm">
                                            Final stats: {streak.kept_days}/{streak.total_days} days kept ({streak.commitment_rate}% success)
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Large cracked lock icon for modal header
 */
function CrackedLockLarge() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-400">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M12 13 L13 16 L11 17 L12 20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M9 14 L10 16" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
    )
}
