/**
 * Reflection Modal
 *
 * NEW FLOW: User adds a note to a step, then selects if it was a success or failure.
 * The outcome is chosen INSIDE the modal, not before opening it.
 * Supports multiple notes per step - each with its own success/failure result.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Lightbulb, MessageSquare, PenLine } from 'lucide-react'

const ReflectionModal = ({
    isOpen,
    onClose,
    onSave,
    stepTitle,
    result: initialResult = null, // Optional pre-selected result (for editing)
    initialData = null // For editing existing notes
}) => {
    const [reflectionText, setReflectionText] = useState('')
    const [lessonLearned, setLessonLearned] = useState('')
    const [selectedResult, setSelectedResult] = useState(null) // 'success' or 'failed'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Populate form when editing or opening
    useEffect(() => {
        if (isOpen && initialData) {
            setReflectionText(initialData.reflection_text || '')
            setLessonLearned(initialData.lesson_learned || '')
            setSelectedResult(initialData.result || initialResult || null)
        } else if (isOpen) {
            setReflectionText('')
            setLessonLearned('')
            setSelectedResult(initialResult || null)
        }
    }, [isOpen, initialData, initialResult])

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
        if (!selectedResult) {
            setError('Please select if this was a success or learning moment')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await onSave({
                reflection_text: reflectionText.trim(),
                lesson_learned: lessonLearned.trim(),
                result: selectedResult
            })
            setReflectionText('')
            setLessonLearned('')
            setSelectedResult(null)
        } catch (err) {
            setError(err.message || 'Failed to save')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setReflectionText('')
        setLessonLearned('')
        setSelectedResult(null)
        setError(null)
        onClose()
    }

    const isSuccess = selectedResult === 'success'
    const isFailed = selectedResult === 'failed'

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-brand-gold/20">
                                    <PenLine className="w-6 h-6 text-brand-gold" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {initialData ? 'Edit Note' : 'Add Note'}
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
                                    placeholder="Describe what you tried and what happened..."
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

                            {/* Result Selection - Success or Failure */}
                            <div>
                                <label className="block text-sm font-medium mb-3 text-white/80">
                                    How did it go? <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedResult('success')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                            isSuccess
                                                ? 'border-brand-teal bg-brand-teal/20 text-brand-teal'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-brand-teal/50 hover:text-brand-teal'
                                        }`}
                                    >
                                        <CheckCircle size={20} />
                                        <span className="font-bold">It Worked!</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedResult('failed')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                            isFailed
                                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:border-red-500/50 hover:text-red-400'
                                        }`}
                                    >
                                        <XCircle size={20} />
                                        <span className="font-bold">Didn't Work</span>
                                    </button>
                                </div>
                                <p className="text-xs text-white/40 mt-2 text-center">
                                    Both outcomes are valuable lessons for your journey
                                </p>
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
                                    disabled={loading || !selectedResult}
                                    className={`flex-[2] py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${
                                        isSuccess
                                            ? 'bg-brand-teal text-brand-blue hover:bg-teal-400'
                                            : isFailed
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-brand-gold text-brand-blue hover:bg-yellow-400'
                                    }`}
                                >
                                    {loading ? 'Saving...' : 'Save Note'}
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
