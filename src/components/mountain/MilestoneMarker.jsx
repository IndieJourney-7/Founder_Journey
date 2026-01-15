import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Check, Clock } from 'lucide-react'
import { formatDeadline, formatTimeRemaining, getTimeRemaining } from '../../utils/pathUtils'

/**
 * MilestoneMarker Component
 *
 * Displays a milestone marker on the mountain path with different visual states:
 * - locked: 3D metallic lock icon (silver/dark)
 * - active: Glowing lock with pulse animation (current milestone)
 * - completed: Checkmark with golden glow
 * - broken: Cracked lock with red tint (promise broken)
 *
 * Based on the user's mockup design with dramatic lighting and 3D effects.
 */
export default function MilestoneMarker({
    milestone,
    position,
    isActive = false,
    onClick,
    formatValue
}) {
    const [isHovered, setIsHovered] = useState(false)

    const isUnlocked = milestone.is_unlocked
    const isBroken = milestone.is_broken || false
    const hasDeadline = !!milestone.deadline

    // Determine the visual state
    const getState = () => {
        if (isBroken) return 'broken'
        if (isUnlocked) return 'completed'
        if (isActive) return 'active'
        return 'locked'
    }

    const state = getState()

    // Style configurations per state
    const stateStyles = {
        locked: {
            bg: 'bg-gradient-to-br from-slate-600 to-slate-800',
            border: 'border-slate-500/50',
            shadow: 'shadow-lg shadow-black/50',
            icon: <Lock size={20} className="text-slate-300" />,
            glow: null
        },
        active: {
            bg: 'bg-gradient-to-br from-amber-200 to-amber-100',
            border: 'border-amber-300',
            shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
            icon: <Lock size={20} className="text-amber-800" />,
            glow: 'rgba(251,191,36,0.4)'
        },
        completed: {
            bg: 'bg-gradient-to-br from-brand-gold to-yellow-500',
            border: 'border-yellow-300',
            shadow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
            icon: milestone.icon_emoji ? (
                <span className="text-xl">{milestone.icon_emoji}</span>
            ) : (
                <Check size={20} className="text-brand-blue" strokeWidth={3} />
            ),
            glow: 'rgba(234,179,8,0.3)'
        },
        broken: {
            bg: 'bg-gradient-to-br from-slate-700 to-slate-900',
            border: 'border-red-500/50',
            shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
            icon: <CrackedLockIcon />,
            glow: 'rgba(239,68,68,0.2)'
        }
    }

    const style = stateStyles[state]

    return (
        <motion.div
            className="absolute z-20 cursor-pointer"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(milestone)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: Math.random() * 0.3 }}
        >
            {/* Outer glow ring for active milestone */}
            {state === 'active' && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
                        width: '200%',
                        height: '200%',
                        left: '-50%',
                        top: '-50%'
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            )}

            {/* Main lock container */}
            <motion.div
                className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 rounded-full
                    flex items-center justify-center
                    ${style.bg} ${style.shadow}
                    border-2 ${style.border}
                    transition-all duration-300
                `}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* 3D effect overlay */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Icon */}
                <div className="relative z-10">
                    {style.icon}
                </div>

                {/* Crack overlay for broken state */}
                {state === 'broken' && (
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 50 50">
                            <path
                                d="M25 5 L27 20 L35 25 L27 30 L25 45"
                                stroke="rgba(239,68,68,0.6)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <path
                                d="M20 15 L25 25 L15 35"
                                stroke="rgba(239,68,68,0.4)"
                                strokeWidth="1.5"
                                fill="none"
                            />
                        </svg>
                    </div>
                )}

                {/* Pulse ring for active */}
                {state === 'active' && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-amber-300"
                        animate={{
                            scale: [1, 1.5],
                            opacity: [0.8, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut'
                        }}
                    />
                )}
            </motion.div>

            {/* Tooltip on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-xl p-3 min-w-[180px] shadow-xl">
                            {/* Title */}
                            <div className="flex items-center gap-2 mb-2">
                                {milestone.icon_emoji && (
                                    <span className="text-lg">{milestone.icon_emoji}</span>
                                )}
                                <h4 className="font-bold text-white text-sm truncate">
                                    {milestone.title || 'Milestone'}
                                </h4>
                            </div>

                            {/* Status badge */}
                            <div className={`
                                inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2
                                ${state === 'completed' ? 'bg-green-500/20 text-green-400' :
                                    state === 'broken' ? 'bg-red-500/20 text-red-400' :
                                        state === 'active' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-slate-500/20 text-slate-400'}
                            `}>
                                {state === 'completed' ? 'COMPLETED' :
                                    state === 'broken' ? 'PROMISE BROKEN' :
                                        state === 'active' ? 'IN PROGRESS' : 'LOCKED'}
                            </div>

                            {/* Target value or task */}
                            {milestone.target_value && formatValue && (
                                <p className="text-brand-gold text-sm font-medium">
                                    Target: {formatValue(milestone.target_value)}
                                </p>
                            )}

                            {/* Deadline */}
                            {hasDeadline && !isUnlocked && (
                                <div className="flex items-center gap-1.5 text-xs text-white/60 mt-1">
                                    <Clock size={12} />
                                    <span>Due: {formatDeadline(milestone.deadline)}</span>
                                </div>
                            )}

                            {/* Commitment preview */}
                            {milestone.commitment && (
                                <p className="text-xs text-red-400/80 mt-2 line-clamp-2">
                                    "{milestone.commitment}"
                                </p>
                            )}

                            {/* Click hint */}
                            <p className="text-xs text-white/40 mt-2 text-center">
                                Click to view details
                            </p>
                        </div>

                        {/* Tooltip arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-3 h-3 bg-slate-900/95 border-l border-t border-white/10 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/**
 * Cracked Lock Icon SVG
 * Custom icon showing a broken/cracked lock
 */
function CrackedLockIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-slate-400"
        >
            {/* Lock body */}
            <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            {/* Lock shackle (broken) */}
            <path
                d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
            {/* Crack lines */}
            <path
                d="M12 13 L13 16 L11 17 L12 20"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M9 14 L10 16"
                stroke="#ef4444"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
            />
        </svg>
    )
}
