import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Target, History, Settings } from 'lucide-react'

/**
 * MetricProgressModal
 *
 * Allows users to:
 * 1. Setup metric tracking (first time) - target value, prefix/suffix
 * 2. Update current progress value
 * 3. View progress history
 */
export default function MetricProgressModal({
    isOpen,
    onClose,
    currentMountain,
    hasMetricProgress,
    onUpdateProgress,
    onSetupMetric
}) {
    const [mode, setMode] = useState('update') // 'update' | 'setup' | 'history'
    const [currentValue, setCurrentValue] = useState('')
    const [targetValue, setTargetValue] = useState('')
    const [metricPrefix, setMetricPrefix] = useState('$')
    const [metricSuffix, setMetricSuffix] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Preset metric types for quick selection
    const METRIC_PRESETS = [
        { label: 'Revenue', prefix: '$', suffix: 'MRR', example: '$1,000 MRR' },
        { label: 'Followers', prefix: '', suffix: 'followers', example: '1,000 followers' },
        { label: 'Customers', prefix: '', suffix: 'customers', example: '100 customers' },
        { label: 'Users', prefix: '', suffix: 'users', example: '1,000 users' },
        { label: 'Downloads', prefix: '', suffix: 'downloads', example: '10K downloads' },
        { label: 'Custom', prefix: '', suffix: '', example: 'Set your own' }
    ]

    // Initialize values from currentMountain
    useEffect(() => {
        if (currentMountain) {
            setCurrentValue(currentMountain.current_value?.toString() || '')
            setTargetValue(currentMountain.target_value?.toString() || '')
            setMetricPrefix(currentMountain.metric_prefix || '$')
            setMetricSuffix(currentMountain.metric_suffix || '')

            // Determine initial mode
            if (!hasMetricProgress) {
                setMode('setup')
            } else {
                setMode('update')
            }
        }
    }, [currentMountain, hasMetricProgress, isOpen])

    const handlePresetClick = (preset) => {
        setMetricPrefix(preset.prefix)
        setMetricSuffix(preset.suffix)
    }

    const handleSetupSubmit = async (e) => {
        e.preventDefault()
        if (!targetValue || isNaN(parseFloat(targetValue))) return

        setIsSubmitting(true)
        try {
            await onSetupMetric({
                target_value: parseFloat(targetValue),
                current_value: parseFloat(currentValue) || 0,
                metric_prefix: metricPrefix,
                metric_suffix: metricSuffix
            })
            setMode('update')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault()
        if (!currentValue || isNaN(parseFloat(currentValue))) return

        setIsSubmitting(true)
        try {
            await onUpdateProgress(parseFloat(currentValue))
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatMetricValue = (value) => {
        if (value === null || value === undefined) return '0'
        const num = parseFloat(value)
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toLocaleString()
    }

    const progressPercent = currentMountain?.target_value
        ? Math.min((parseFloat(currentValue || 0) / currentMountain.target_value) * 100, 100)
        : 0

    const history = currentMountain?.progress_history || []

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
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-gold/20 rounded-lg">
                                <TrendingUp size={20} className="text-brand-gold" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {mode === 'setup' ? 'Setup Goal Tracking' :
                                     mode === 'history' ? 'Progress History' : 'Update Progress'}
                                </h3>
                                <p className="text-sm text-white/50">
                                    {currentMountain?.title || 'Your Journey'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Mode Tabs (only show if metric is setup) */}
                    {hasMetricProgress && (
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setMode('update')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                    mode === 'update'
                                        ? 'text-brand-gold border-b-2 border-brand-gold'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                <TrendingUp size={14} className="inline mr-2" />
                                Update
                            </button>
                            <button
                                onClick={() => setMode('history')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                    mode === 'history'
                                        ? 'text-brand-gold border-b-2 border-brand-gold'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                <History size={14} className="inline mr-2" />
                                History
                            </button>
                            <button
                                onClick={() => setMode('setup')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                    mode === 'setup'
                                        ? 'text-brand-gold border-b-2 border-brand-gold'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                <Settings size={14} className="inline mr-2" />
                                Settings
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {/* SETUP MODE */}
                        {mode === 'setup' && (
                            <form onSubmit={handleSetupSubmit} className="space-y-5">
                                {/* Metric Type Presets */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        What are you tracking?
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {METRIC_PRESETS.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => handlePresetClick(preset)}
                                                className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                                                    metricPrefix === preset.prefix && metricSuffix === preset.suffix
                                                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Target Value */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        <Target size={14} className="inline mr-1" />
                                        Target Goal
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={metricPrefix}
                                            onChange={(e) => setMetricPrefix(e.target.value)}
                                            placeholder="$"
                                            className="w-16 px-3 py-3 rounded-lg bg-black/30 border border-white/10 text-white text-center focus:border-brand-gold focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            value={targetValue}
                                            onChange={(e) => setTargetValue(e.target.value)}
                                            placeholder="1000"
                                            className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-gold focus:outline-none text-lg font-bold"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={metricSuffix}
                                            onChange={(e) => setMetricSuffix(e.target.value)}
                                            placeholder="MRR"
                                            className="w-24 px-3 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 mt-2">
                                        Preview: {metricPrefix}{targetValue || '0'} {metricSuffix}
                                    </p>
                                </div>

                                {/* Current Value (optional for setup) */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Current Progress (optional)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/60">{metricPrefix}</span>
                                        <input
                                            type="number"
                                            value={currentValue}
                                            onChange={(e) => setCurrentValue(e.target.value)}
                                            placeholder="0"
                                            className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-gold focus:outline-none"
                                        />
                                        <span className="text-white/60">{metricSuffix}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !targetValue}
                                    className="w-full py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Goal Settings'}
                                </button>
                            </form>
                        )}

                        {/* UPDATE MODE */}
                        {mode === 'update' && (
                            <form onSubmit={handleUpdateSubmit} className="space-y-5">
                                {/* Current Progress Display */}
                                <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white/60 text-sm">Current Progress</span>
                                        <span className="text-brand-gold font-bold">
                                            {Math.round(progressPercent)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            className="h-full bg-gradient-to-r from-brand-gold to-brand-teal rounded-full"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-sm">
                                        <span className="text-white font-bold">
                                            {currentMountain?.metric_prefix}{formatMetricValue(currentValue || currentMountain?.current_value || 0)} {currentMountain?.metric_suffix}
                                        </span>
                                        <span className="text-white/40">
                                            of {currentMountain?.metric_prefix}{formatMetricValue(currentMountain?.target_value)} {currentMountain?.metric_suffix}
                                        </span>
                                    </div>
                                </div>

                                {/* Update Input */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        What's your current number?
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/60 text-lg">{currentMountain?.metric_prefix}</span>
                                        <input
                                            type="number"
                                            value={currentValue}
                                            onChange={(e) => setCurrentValue(e.target.value)}
                                            placeholder={currentMountain?.current_value?.toString() || '0'}
                                            className="flex-1 px-4 py-4 rounded-xl bg-black/30 border border-white/10 text-white text-2xl font-bold focus:border-brand-gold focus:outline-none text-center"
                                            autoFocus
                                            required
                                        />
                                        <span className="text-white/60 text-lg">{currentMountain?.metric_suffix}</span>
                                    </div>
                                </div>

                                {/* Quick increment buttons */}
                                <div className="flex gap-2">
                                    {[10, 50, 100, 500].map((increment) => (
                                        <button
                                            key={increment}
                                            type="button"
                                            onClick={() => setCurrentValue((prev) => {
                                                const current = parseFloat(prev) || parseFloat(currentMountain?.current_value) || 0
                                                return (current + increment).toString()
                                            })}
                                            className="flex-1 py-2 bg-white/10 text-white/70 text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            +{increment}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !currentValue}
                                    className="w-full py-4 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 text-lg"
                                >
                                    {isSubmitting ? 'Saving...' : 'Update Progress'}
                                </button>
                            </form>
                        )}

                        {/* HISTORY MODE */}
                        {mode === 'history' && (
                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <div className="text-center py-8 text-white/50">
                                        <History size={32} className="mx-auto mb-3 opacity-50" />
                                        <p>No progress updates yet</p>
                                        <p className="text-sm">Your updates will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {[...history].reverse().map((entry, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-black/20 rounded-lg border border-white/5"
                                            >
                                                <div>
                                                    <span className="text-white font-bold">
                                                        {currentMountain?.metric_prefix}{formatMetricValue(entry.value)} {currentMountain?.metric_suffix}
                                                    </span>
                                                    <span className="text-white/40 text-xs ml-2">
                                                        ({Math.round((entry.value / currentMountain?.target_value) * 100)}%)
                                                    </span>
                                                </div>
                                                <span className="text-white/40 text-sm">
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
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
