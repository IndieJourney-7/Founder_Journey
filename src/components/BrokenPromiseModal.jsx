import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, MessageSquare } from 'lucide-react'

/**
 * BrokenPromiseModal Component
 *
 * Dramatic modal shown when a promise/deadline is broken:
 * - Cracked lock visual animation
 * - "PROMISE BROKEN" message
 * - Task and deadline info
 * - Reason capture (why did they fail)
 * - Consequence trigger
 *
 * Based on user's mockup with the cracked lock design.
 */
export default function BrokenPromiseModal({
    isOpen,
    onClose,
    milestone,
    onSubmitReason
}) {
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!reason.trim()) return
        setIsSubmitting(true)
        await onSubmitReason?.(milestone.id, reason)
        setIsSubmitting(false)
        onClose()
    }

    if (!isOpen || !milestone) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden"
                >
                    {/* Cracked Lock Animation */}
                    <div className="relative py-10 flex flex-col items-center bg-gradient-to-b from-red-500/10 to-transparent">
                        {/* Animated crack lines in background */}
                        <motion.svg
                            className="absolute inset-0 w-full h-full opacity-20"
                            viewBox="0 0 400 200"
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.path
                                d="M200 10 L205 50 L190 80 L210 120 L195 160 L200 190"
                                stroke="#ef4444"
                                strokeWidth="3"
                                fill="none"
                                variants={{
                                    hidden: { pathLength: 0 },
                                    visible: { pathLength: 1, transition: { duration: 0.8, delay: 0.2 } }
                                }}
                            />
                            <motion.path
                                d="M180 30 L200 70 L170 100"
                                stroke="#ef4444"
                                strokeWidth="2"
                                fill="none"
                                variants={{
                                    hidden: { pathLength: 0 },
                                    visible: { pathLength: 1, transition: { duration: 0.5, delay: 0.5 } }
                                }}
                            />
                            <motion.path
                                d="M220 40 L200 80 L230 110"
                                stroke="#ef4444"
                                strokeWidth="2"
                                fill="none"
                                variants={{
                                    hidden: { pathLength: 0 },
                                    visible: { pathLength: 1, transition: { duration: 0.5, delay: 0.6 } }
                                }}
                            />
                        </motion.svg>

                        {/* Cracked Lock Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                            className="relative"
                        >
                            <CrackedLockSVG />
                        </motion.div>

                        {/* Promise Broken Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 flex items-center gap-2"
                        >
                            <div className="h-px w-8 bg-red-500/50" />
                            <span className="text-red-400 font-bold tracking-[0.3em] text-sm">
                                PROMISE BROKEN
                            </span>
                            <div className="h-px w-8 bg-red-500/50" />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="px-6 pb-6"
                    >
                        {/* Milestone Info Card */}
                        <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-5 mb-5">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-2xl">{milestone.icon_emoji || '🎯'}</div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        Milestone {milestone.sort_order || ''}:
                                    </h3>
                                    <p className="text-white/70">
                                        {milestone.title || 'Untitled Milestone'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {milestone.commitment && (
                                    <div className="flex">
                                        <span className="text-white/50 w-20">Task:</span>
                                        <span className="text-white/80">{milestone.commitment}</span>
                                    </div>
                                )}
                                <div className="flex">
                                    <span className="text-white/50 w-20">Deadline:</span>
                                    <span className="text-red-400 font-medium">Missed</span>
                                </div>
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
                                <MessageSquare size={16} />
                                What happened? (Be honest with yourself)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="I procrastinated because..."
                                className="w-full h-24 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none focus:outline-none focus:border-red-500/50 transition-colors"
                            />
                        </div>

                        {/* Consequence Info */}
                        {milestone.consequence && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
                                <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                                    <AlertTriangle size={16} />
                                    <span className="font-medium">Consequence Triggered</span>
                                </div>
                                <p className="text-white/80 text-sm">
                                    {milestone.consequence}
                                </p>
                            </div>
                        )}

                        {/* Philosophy Message */}
                        <div className="text-center mb-5 py-4 border-t border-b border-white/5">
                            <p className="text-white/60 text-sm italic">
                                "It's not about being perfect, it's about progress.
                            </p>
                            <p className="text-white/60 text-sm italic">
                                Every setback is a setup for a comeback."
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={!reason.trim() || isSubmitting}
                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Accept & Move Forward'}
                            </button>
                        </div>

                        {/* Skip option */}
                        <button
                            onClick={onClose}
                            className="w-full mt-3 py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
                        >
                            Skip for now
                        </button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Large Cracked Lock SVG with animated cracks
 */
function CrackedLockSVG() {
    return (
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="filter drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        >
            {/* Lock body */}
            <rect
                x="20"
                y="45"
                width="60"
                height="45"
                rx="8"
                fill="url(#lockGradient)"
                stroke="#475569"
                strokeWidth="3"
            />

            {/* 3D effect on lock body */}
            <rect
                x="20"
                y="45"
                width="60"
                height="20"
                rx="8"
                fill="url(#lockHighlight)"
                opacity="0.3"
            />

            {/* Lock shackle */}
            <path
                d="M30 45 V35 A20 20 0 0 1 70 35 V45"
                fill="none"
                stroke="#475569"
                strokeWidth="8"
                strokeLinecap="round"
            />

            {/* Shackle highlight */}
            <path
                d="M34 45 V35 A16 16 0 0 1 66 35"
                fill="none"
                stroke="#64748b"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
            />

            {/* Main crack */}
            <motion.path
                d="M50 50 L53 62 L47 70 L52 78 L48 90"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            />

            {/* Secondary cracks */}
            <motion.path
                d="M42 55 L50 65 L38 75"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.4, delay: 0.6 }}
            />
            <motion.path
                d="M58 58 L52 68 L62 78"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.4, delay: 0.7 }}
            />

            {/* Small fragments */}
            <motion.circle
                cx="45"
                cy="60"
                r="2"
                fill="#ef4444"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
            />
            <motion.circle
                cx="55"
                cy="72"
                r="1.5"
                fill="#ef4444"
                opacity="0.6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
            />

            {/* Gradients */}
            <defs>
                <linearGradient id="lockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="lockHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    )
}
