import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Flame, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMountain } from '../context/MountainContext'

/**
 * DailyCheckIn Component
 *
 * Calendar-style check-in tracker for commitment promises
 * Shows ✓ for kept promises, ✗ for broken ones
 */
export default function DailyCheckIn({ milestoneId }) {
    const { checkins, checkIn, getCurrentMilestoneStreak } = useMountain()

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [checkingIn, setCheckingIn] = useState(false)

    // Filter check-ins for this milestone
    const milestoneCheckins = useMemo(() => {
        return checkins.filter(c => c.milestone_id === milestoneId)
    }, [checkins, milestoneId])

    // Get streak stats
    const streak = useMemo(() => {
        return getCurrentMilestoneStreak(milestoneId)
    }, [milestoneId, getCurrentMilestoneStreak])

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0]
    const todayCheckin = milestoneCheckins.find(c => c.checkin_date === today)

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before first of month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ day: null, date: null })
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateStr = date.toISOString().split('T')[0]
            const checkin = milestoneCheckins.find(c => c.checkin_date === dateStr)

            days.push({
                day,
                date: dateStr,
                checkin,
                isToday: dateStr === today,
                isFuture: date > new Date()
            })
        }

        return days
    }, [currentMonth, milestoneCheckins, today])

    // Handle check-in
    const handleCheckIn = async (keptPromise) => {
        setCheckingIn(true)
        await checkIn(milestoneId, keptPromise)
        setCheckingIn(false)
    }

    // Navigate months
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        if (next <= new Date()) {
            setCurrentMonth(next)
        }
    }

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="bg-gradient-to-br from-[#1a2a4a] to-[#0f1f3d] rounded-2xl border border-white/10 overflow-hidden">
            {/* Header with streak */}
            <div className="bg-white/5 px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-brand-gold" />
                        <span className="font-medium text-white">Promise Tracker</span>
                    </div>
                    {streak.current_streak > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full">
                            <Flame size={14} className="text-orange-400" />
                            <span className="text-sm font-bold text-orange-400">
                                {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{streak.total_days}</div>
                        <div className="text-xs text-white/50">Days Tracked</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">{streak.kept_days}</div>
                        <div className="text-xs text-white/50">Promises Kept</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-brand-gold">{streak.commitment_rate}%</div>
                        <div className="text-xs text-white/50">Success Rate</div>
                    </div>
                </div>
            </div>

            {/* Today's Check-in */}
            {!todayCheckin && (
                <div className="p-5 border-b border-white/10">
                    <p className="text-white/70 text-sm mb-3 text-center">
                        Did you keep your promise today?
                    </p>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCheckIn(true)}
                            disabled={checkingIn}
                            className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Check size={20} />
                            Yes, I did!
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCheckIn(false)}
                            disabled={checkingIn}
                            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400/80 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                            I slipped
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Already checked in today */}
            {todayCheckin && (
                <div className={`p-4 border-b border-white/10 text-center ${
                    todayCheckin.kept_promise ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                    <div className="flex items-center justify-center gap-2">
                        {todayCheckin.kept_promise ? (
                            <>
                                <Check size={20} className="text-green-400" />
                                <span className="text-green-400 font-medium">Promise kept today!</span>
                            </>
                        ) : (
                            <>
                                <X size={20} className="text-red-400" />
                                <span className="text-red-400 font-medium">Marked as slip - keep going!</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={18} className="text-white/60" />
                    </button>
                    <span className="font-medium text-white">{monthName}</span>
                    <button
                        onClick={nextMonth}
                        disabled={currentMonth.getMonth() === new Date().getMonth() &&
                                  currentMonth.getFullYear() === new Date().getFullYear()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronRight size={18} className="text-white/60" />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-xs text-white/40 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((item, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                                !item.day
                                    ? ''
                                    : item.isToday
                                        ? 'ring-2 ring-brand-gold'
                                        : ''
                            } ${
                                item.checkin
                                    ? item.checkin.kept_promise
                                        ? 'bg-green-500/20'
                                        : 'bg-red-500/20'
                                    : item.day && !item.isFuture
                                        ? 'bg-white/5'
                                        : ''
                            }`}
                        >
                            {item.day && (
                                <>
                                    <span className={`${
                                        item.isFuture ? 'text-white/20' : 'text-white/70'
                                    }`}>
                                        {item.day}
                                    </span>
                                    {item.checkin && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {item.checkin.kept_promise ? (
                                                <Check size={14} className="text-green-400" />
                                            ) : (
                                                <X size={12} className="text-red-400" />
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                            <Check size={10} className="text-green-400" />
                        </div>
                        <span>Kept</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center">
                            <X size={10} className="text-red-400" />
                        </div>
                        <span>Slipped</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-white/5"></div>
                        <span>Not tracked</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Compact check-in widget for quick daily check-in
 */
export function QuickCheckIn({ milestoneId, commitment }) {
    const { checkins, checkIn, getCurrentMilestoneStreak } = useMountain()
    const [checkingIn, setCheckingIn] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const todayCheckin = checkins.find(c => c.milestone_id === milestoneId && c.checkin_date === today)

    const streak = getCurrentMilestoneStreak(milestoneId)

    const handleCheckIn = async (keptPromise) => {
        setCheckingIn(true)
        await checkIn(milestoneId, keptPromise)
        setCheckingIn(false)
    }

    if (todayCheckin) {
        return (
            <div className={`p-4 rounded-xl border ${
                todayCheckin.kept_promise
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {todayCheckin.kept_promise ? (
                            <Check size={20} className="text-green-400" />
                        ) : (
                            <X size={20} className="text-red-400" />
                        )}
                        <span className={todayCheckin.kept_promise ? 'text-green-400' : 'text-red-400'}>
                            {todayCheckin.kept_promise ? 'Promise kept!' : 'Slip recorded'}
                        </span>
                    </div>
                    {streak.current_streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-400">
                            <Flame size={16} />
                            <span className="font-bold">{streak.current_streak}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-sm mb-3">
                {commitment ? `🔒 "${commitment}"` : 'Did you keep your promise today?'}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => handleCheckIn(true)}
                    disabled={checkingIn}
                    className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                >
                    <Check size={16} />
                    Kept it
                </button>
                <button
                    onClick={() => handleCheckIn(false)}
                    disabled={checkingIn}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                >
                    <X size={16} />
                    Slipped
                </button>
            </div>
            {streak.current_streak > 0 && (
                <div className="mt-3 text-center text-sm text-white/50">
                    <Flame size={14} className="inline text-orange-400 mr-1" />
                    {streak.current_streak} day streak ({streak.commitment_rate}% kept)
                </div>
            )}
        </div>
    )
}
