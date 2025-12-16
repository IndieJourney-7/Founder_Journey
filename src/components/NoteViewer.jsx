/**
 * Note Viewer Modal
 * 
 * Displays a step's reflection note with options to edit or delete.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Edit2, Trash2, Lightbulb, MessageSquare } from 'lucide-react'

const NoteViewer = ({
    isOpen,
    onClose,
    step,
    note,
    onEdit,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    if (!step || !note) return null

    const isSuccess = note.result === 'success'

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await onDelete(step.id, note.id)
            onClose()
        } catch (err) {
            console.error('Delete failed:', err)
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleEdit = () => {
        onEdit(step, note)
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
                        className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`p-6 ${isSuccess ? 'bg-brand-teal/10' : 'bg-red-500/10'}`}>
                            <div className="flex justify-between items-start">
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
                                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                        <p className={`text-sm font-medium ${isSuccess ? 'text-brand-teal' : 'text-red-400'}`}>
                                            {isSuccess ? 'Success' : 'Did not work'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/50 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            {/* Reflection */}
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white/60">
                                    <MessageSquare size={14} />
                                    What happened
                                </div>
                                <p className="text-white leading-relaxed">
                                    {note.reflection_text || note.notes || 'No reflection recorded'}
                                </p>
                            </div>

                            {/* Lesson Learned */}
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white/60">
                                    <Lightbulb size={14} />
                                    Lesson learned
                                </div>
                                <p className="text-white leading-relaxed bg-brand-gold/10 p-4 rounded-lg border border-brand-gold/20">
                                    {note.lesson_learned || 'No lesson recorded'}
                                </p>
                            </div>

                            {/* Timestamp */}
                            <div className="text-xs text-white/40">
                                Recorded on {new Date(note.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            {showDeleteConfirm ? (
                                <>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                                    >
                                        Keep Note
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                        Edit Reflection
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default NoteViewer
