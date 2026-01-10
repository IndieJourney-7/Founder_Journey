import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Gift, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react'
import { COMMITMENT_PRESETS, REWARD_PRESETS, generateDefaultMilestones } from '../lib/milestoneService'

/**
 * MilestoneSetupModal Component
 *
 * Allows users to create milestones with commitments and rewards.
 * Features:
 * - Auto-generate suggested milestones
 * - Custom milestone creation
 * - Preset commitments and rewards
 * - Beautiful Mobbin-inspired UI
 */
export default function MilestoneSetupModal({
    isOpen,
    onClose,
    targetValue,
    metricPrefix = '',
    metricSuffix = '',
    onSave
}) {
    const [milestones, setMilestones] = useState([])
    const [expandedIndex, setExpandedIndex] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPresets, setShowPresets] = useState({ type: null, index: null })

    // Generate default milestones on modal open
    useMemo(() => {
        if (isOpen && milestones.length === 0 && targetValue > 0) {
            const defaults = generateDefaultMilestones(targetValue)
            setMilestones(defaults)
            setExpandedIndex(0) // Expand first milestone
        }
    }, [isOpen, targetValue])

    // Reset when modal closes
    const handleClose = () => {
        setMilestones([])
        setExpandedIndex(null)
        setShowPresets({ type: null, index: null })
        onClose()
    }

    // Format value with prefix/suffix
    const formatValue = (value) => {
        if (!value && value !== 0) return ''
        const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
        return `${metricPrefix}${formatted}${metricSuffix ? ' ' + metricSuffix : ''}`
    }

    // Add new milestone
    const addMilestone = () => {
        const lastValue = milestones.length > 0
            ? milestones[milestones.length - 1].target_value
            : 0
        const newValue = Math.min(lastValue + Math.round(targetValue * 0.1), targetValue)

        const newMilestone = {
            target_value: newValue,
            title: `Milestone ${milestones.length + 1}`,
            icon_emoji: '🎯',
            commitment: '',
            reward: '',
            sort_order: milestones.length
        }

        setMilestones([...milestones, newMilestone])
        setExpandedIndex(milestones.length)
    }

    // Remove milestone
    const removeMilestone = (index) => {
        setMilestones(milestones.filter((_, i) => i !== index))
        if (expandedIndex === index) {
            setExpandedIndex(null)
        }
    }

    // Update milestone
    const updateMilestone = (index, field, value) => {
        setMilestones(milestones.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        ))
    }

    // Select preset
    const selectPreset = (preset, type, index) => {
        updateMilestone(index, type, preset.label)
        setShowPresets({ type: null, index: null })
    }

    // Handle save
    const handleSave = async () => {
        if (milestones.length === 0) return

        setIsSubmitting(true)
        await onSave(milestones.map((m, i) => ({
            ...m,
            sort_order: i
        })))
        setIsSubmitting(false)
        handleClose()
    }

    // Emoji picker options
    const emojis = ['🎯', '🌱', '🚀', '⛰️', '🔥', '🏆', '💎', '⭐', '🎉', '💪', '🌟', '🏅']

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-lg max-h-[90vh] bg-gradient-to-br from-[#1a2a4a] to-brand-blue rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-gold/20 to-transparent px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Lock size={20} className="text-brand-gold" />
                            <h2 className="text-lg font-bold text-white">Set Up Your Milestones</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-brand-gold/10 border-b border-brand-gold/20 px-5 py-3 flex-shrink-0">
                        <div className="flex items-start gap-2">
                            <Sparkles size={16} className="text-brand-gold mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-white/70">
                                Break your <span className="text-brand-gold font-medium">{formatValue(targetValue)}</span> goal into milestones.
                                Lock yourself into commitments and set rewards for when you unlock them.
                            </p>
                        </div>
                    </div>

                    {/* Milestones List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white/5 rounded-xl border transition-colors ${
                                    expandedIndex === index
                                        ? 'border-brand-gold/50'
                                        : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                {/* Milestone Header */}
                                <button
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                    className="w-full p-4 flex items-center gap-3"
                                >
                                    {/* Emoji */}
                                    <span className="text-2xl">{milestone.icon_emoji}</span>

                                    {/* Info */}
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-white">{milestone.title}</div>
                                        <div className="text-sm text-brand-gold">
                                            {formatValue(milestone.target_value)}
                                        </div>
                                    </div>

                                    {/* Indicators */}
                                    <div className="flex items-center gap-2">
                                        {milestone.commitment && (
                                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <Lock size={12} className="text-red-400" />
                                            </div>
                                        )}
                                        {milestone.reward && (
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Gift size={12} className="text-green-400" />
                                            </div>
                                        )}
                                        {expandedIndex === index ? (
                                            <ChevronUp size={18} className="text-white/40" />
                                        ) : (
                                            <ChevronDown size={18} className="text-white/40" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                                                {/* Title & Target */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-white/50 mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            value={milestone.title}
                                                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                                            placeholder="Milestone name"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-white/50 mb-1">Target Value</label>
                                                        <input
                                                            type="number"
                                                            value={milestone.target_value}
                                                            onChange={(e) => updateMilestone(index, 'target_value', parseInt(e.target.value) || 0)}
                                                            min="1"
                                                            max={targetValue}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Emoji Picker */}
                                                <div>
                                                    <label className="block text-xs text-white/50 mb-1">Icon</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {emojis.map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => updateMilestone(index, 'icon_emoji', emoji)}
                                                                className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-colors ${
                                                                    milestone.icon_emoji === emoji
                                                                        ? 'bg-brand-gold/20 border-brand-gold'
                                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Commitment */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-xs text-white/50 flex items-center gap-1">
                                                            <Lock size={10} className="text-red-400" />
                                                            Commitment (Lock)
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPresets(
                                                                showPresets.type === 'commitment' && showPresets.index === index
                                                                    ? { type: null, index: null }
                                                                    : { type: 'commitment', index }
                                                            )}
                                                            className="text-xs text-brand-gold hover:underline"
                                                        >
                                                            {showPresets.type === 'commitment' && showPresets.index === index ? 'Hide' : 'Suggestions'}
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={milestone.commitment}
                                                        onChange={(e) => updateMilestone(index, 'commitment', e.target.value)}
                                                        placeholder="e.g., No Netflix until I hit this"
                                                        className="w-full bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                                    />
                                                    {showPresets.type === 'commitment' && showPresets.index === index && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {COMMITMENT_PRESETS.map((preset) => (
                                                                <button
                                                                    key={preset.label}
                                                                    type="button"
                                                                    onClick={() => selectPreset(preset, 'commitment', index)}
                                                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-300 transition-colors"
                                                                >
                                                                    {preset.icon} {preset.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Reward */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-xs text-white/50 flex items-center gap-1">
                                                            <Gift size={10} className="text-green-400" />
                                                            Reward (When Unlocked)
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPresets(
                                                                showPresets.type === 'reward' && showPresets.index === index
                                                                    ? { type: null, index: null }
                                                                    : { type: 'reward', index }
                                                            )}
                                                            className="text-xs text-brand-gold hover:underline"
                                                        >
                                                            {showPresets.type === 'reward' && showPresets.index === index ? 'Hide' : 'Suggestions'}
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={milestone.reward}
                                                        onChange={(e) => updateMilestone(index, 'reward', e.target.value)}
                                                        placeholder="e.g., Treat myself to a nice dinner"
                                                        className="w-full bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                                    />
                                                    {showPresets.type === 'reward' && showPresets.index === index && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {REWARD_PRESETS.map((preset) => (
                                                                <button
                                                                    key={preset.label}
                                                                    type="button"
                                                                    onClick={() => selectPreset(preset, 'reward', index)}
                                                                    className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs text-green-300 transition-colors"
                                                                >
                                                                    {preset.icon} {preset.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMilestone(index)}
                                                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove Milestone
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}

                        {/* Add Milestone Button */}
                        <button
                            onClick={addMilestone}
                            className="w-full py-3 border-2 border-dashed border-white/20 hover:border-brand-gold/50 rounded-xl text-white/60 hover:text-brand-gold font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={18} />
                            Add Milestone
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="bg-white/5 px-5 py-4 border-t border-white/10 flex gap-3 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting || milestones.length === 0}
                            className="flex-1 py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Target size={18} />
                                    Lock In {milestones.length} Milestone{milestones.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
