import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Target, DollarSign, Users, Hash, Percent } from 'lucide-react'

/**
 * UpdateProgressModal Component
 *
 * Dual-purpose modal:
 * 1. If metric tracking is set up: Update the current value
 * 2. If not set up: Configure metric tracking first
 */
export default function UpdateProgressModal({
    isOpen,
    onClose,
    currentMountain,
    hasMetricProgress,
    onUpdateProgress,
    onSetupMetric
}) {
    const [currentValue, setCurrentValue] = useState('')
    const [targetValue, setTargetValue] = useState('')
    const [metricPrefix, setMetricPrefix] = useState('$')
    const [metricSuffix, setMetricSuffix] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize values when modal opens
    useEffect(() => {
        if (isOpen && hasMetricProgress && currentMountain) {
            setCurrentValue(currentMountain.current_value?.toString() || '0')
        }
    }, [isOpen, hasMetricProgress, currentMountain])

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            if (!hasMetricProgress) {
                setTargetValue('')
                setMetricPrefix('$')
                setMetricSuffix('')
            }
            setCurrentValue('')
            setIsSubmitting(false)
        }
    }, [isOpen, hasMetricProgress])

    const handleUpdateProgress = async (e) => {
        e.preventDefault()
        const value = parseFloat(currentValue.replace(/,/g, ''))
        if (isNaN(value) || value < 0) return

        setIsSubmitting(true)
        await onUpdateProgress(value)
        setIsSubmitting(false)
    }

    const handleSetupMetric = async (e) => {
        e.preventDefault()
        const target = parseFloat(targetValue.replace(/,/g, ''))
        if (isNaN(target) || target <= 0) return

        setIsSubmitting(true)
        await onSetupMetric({
            target_value: target,
            current_value: 0,
            metric_prefix: metricPrefix,
            metric_suffix: metricSuffix
        })
        setIsSubmitting(false)
    }

    // Format number with commas
    const formatNumber = (value) => {
        const num = value.replace(/[^0-9.]/g, '')
        const parts = num.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
    }

    const handleValueChange = (setter) => (e) => {
        setter(formatNumber(e.target.value))
    }

    // Preset buttons for common metrics
    const metricPresets = [
        { prefix: '$', suffix: '', label: 'Revenue', icon: DollarSign },
        { prefix: '', suffix: 'users', label: 'Users', icon: Users },
        { prefix: '', suffix: 'subscribers', label: 'Subscribers', icon: Users },
        { prefix: '', suffix: '%', label: 'Percentage', icon: Percent },
        { prefix: '', suffix: '', label: 'Custom', icon: Hash }
    ]

    if (!isOpen) return null

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
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-gradient-to-br from-[#1a2a4a] to-brand-blue rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {hasMetricProgress ? (
                                <TrendingUp size={20} className="text-brand-gold" />
                            ) : (
                                <Target size={20} className="text-brand-gold" />
                            )}
                            <h2 className="text-lg font-bold text-white">
                                {hasMetricProgress ? 'Update Progress' : 'Set Up Goal Tracking'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {hasMetricProgress ? (
                            /* Update Progress Form */
                            <form onSubmit={handleUpdateProgress} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Current Value
                                    </label>
                                    <div className="relative">
                                        {currentMountain?.metric_prefix && (
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                                {currentMountain.metric_prefix}
                                            </span>
                                        )}
                                        <input
                                            type="text"
                                            value={currentValue}
                                            onChange={handleValueChange(setCurrentValue)}
                                            placeholder="0"
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold ${
                                                currentMountain?.metric_prefix ? 'pl-8 pr-16' : 'px-4'
                                            }`}
                                            autoFocus
                                        />
                                        {currentMountain?.metric_suffix && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                                                {currentMountain.metric_suffix}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-white/40 mt-1">
                                        Target: {currentMountain?.metric_prefix}{currentMountain?.target_value?.toLocaleString()} {currentMountain?.metric_suffix}
                                    </div>
                                </div>

                                {/* Progress Preview */}
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white/60">Progress</span>
                                        <span className="text-brand-gold font-bold">
                                            {currentMountain?.target_value
                                                ? Math.min(100, Math.round((parseFloat(currentValue.replace(/,/g, '') || 0) / currentMountain.target_value) * 100))
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${currentMountain?.target_value
                                                    ? Math.min(100, (parseFloat(currentValue.replace(/,/g, '') || 0) / currentMountain.target_value) * 100)
                                                    : 0}%`
                                            }}
                                            className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 rounded-full"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !currentValue}
                                    className="w-full py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <TrendingUp size={18} />
                                            Update Progress
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* Setup Metric Tracking Form */
                            <form onSubmit={handleSetupMetric} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        What metric are you tracking?
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {metricPresets.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => {
                                                    setMetricPrefix(preset.prefix)
                                                    setMetricSuffix(preset.suffix)
                                                }}
                                                className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                                                    metricPrefix === preset.prefix && metricSuffix === preset.suffix
                                                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                <preset.icon size={16} />
                                                <span className="text-[10px]">{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom prefix/suffix */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Prefix</label>
                                        <input
                                            type="text"
                                            value={metricPrefix}
                                            onChange={(e) => setMetricPrefix(e.target.value)}
                                            placeholder="$"
                                            maxLength={5}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Suffix</label>
                                        <input
                                            type="text"
                                            value={metricSuffix}
                                            onChange={(e) => setMetricSuffix(e.target.value)}
                                            placeholder="users"
                                            maxLength={15}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Target Goal
                                    </label>
                                    <div className="relative">
                                        {metricPrefix && (
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                                {metricPrefix}
                                            </span>
                                        )}
                                        <input
                                            type="text"
                                            value={targetValue}
                                            onChange={handleValueChange(setTargetValue)}
                                            placeholder="1,000"
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold ${
                                                metricPrefix ? 'pl-8 pr-20' : 'px-4 pr-16'
                                            }`}
                                        />
                                        {metricSuffix && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                                                {metricSuffix}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Preview */}
                                {targetValue && (
                                    <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3 text-center">
                                        <span className="text-white/60 text-sm">Your goal: </span>
                                        <span className="text-brand-gold font-bold">
                                            {metricPrefix}{targetValue} {metricSuffix}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !targetValue}
                                    className="w-full py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Target size={18} />
                                            Set Up Tracking
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
