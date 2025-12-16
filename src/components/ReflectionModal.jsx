/**
 * Reflection Modal
 * 
 * Shown when user clicks Success/Fail on a step.
 * Requires user to enter reflection and lesson before updating status.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Lightbulb, MessageSquare } from 'lucide-react'

const ReflectionModal = ({
    isOpen,
    onClose,
    onSave,
    stepTitle,
    result, // 'success' or 'failed'
    initialData = null // For editing existing notes
}) => {
    const [reflectionText, setReflectionText] = useState('')
    const [lessonLearned, setLessonLearned] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const isSuccess = result === 'success'

    // Populate form when editing
    useEffect(() => {
        if (isOpen && initialData) {
            setReflectionText(initialData.reflection_text || '')
            setLessonLearned(initialData.lesson_learned || '')
        } else if (isOpen) {
            setReflectionText('')
            setLessonLearned('')
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!reflectionText.trim()) {
            setError('Please describe what happened')
            return
        }
        if (!lessonLearned.trim()) {
            setError('Please share what you learned')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await onSave({
                reflection_text: reflectionText.trim(),
                lesson_learned: lessonLearned.trim()
            })
            setReflectionText('')
            setLessonLearned('')
        } catch (err) {
            setError(err.message || 'Failed to save')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setReflectionText('')
        setLessonLearned('')
        setError(null)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                {isSuccess ? (
                                    <div className="p-2 rounded-full bg-brand-teal/20">
                                        <CheckCircle className="w-6 h-6 text-brand-teal" />
                                    </div>
                                ) : (
                                    <div className="p-2 rounded-full bg-red-500/20">
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {isSuccess ? 'It Worked!' : 'It Didn\'t Work'}
                                    </h3>
                                    <p className="text-sm text-white/60">{stepTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white/50 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* What happened? */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-white/80">
                                    <MessageSquare size={16} className="text-brand-gold" />
                                    What happened?
                                    <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={reflectionText}
                                    onChange={(e) => setReflectionText(e.target.value)}
                                    placeholder={isSuccess
                                        ? "Describe what worked and why..."
                                        : "Describe what went wrong..."
                                    }
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none h-24 resize-none text-white placeholder-white/30"
                                    autoFocus
                                />
                            </div>

                            {/* What did you learn? */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-white/80">
                                    <Lightbulb size={16} className="text-brand-gold" />
                                    What did you learn?
                                    <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={lessonLearned}
                                    onChange={(e) => setLessonLearned(e.target.value)}
                                    placeholder="What insight will you carry forward?"
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none h-24 resize-none text-white placeholder-white/30"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-[2] py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${isSuccess
                                            ? 'bg-brand-teal text-brand-blue hover:bg-teal-400'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {loading ? 'Saving...' : 'Save Reflection'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ReflectionModal
