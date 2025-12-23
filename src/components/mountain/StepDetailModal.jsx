import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Share2, CheckCircle2, XCircle } from 'lucide-react';
import * as notesService from '../../lib/notesService';
import LessonCardExport from '../sharing/LessonCardExport';

/**
 * StepDetailModal
 *
 * Shows all lessons for a clicked step
 * Features:
 * - View all lessons for this step
 * - Add new lessons
 * - Edit existing lessons
 * - Delete lessons
 * - Share individual lessons (TODO: Phase 5)
 */
export default function StepDetailModal({ step, isOpen, onClose, onUpdate }) {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        reflection_text: '',
        lesson_learned: '',
        result: step?.status === 'failed' ? 'failed' : 'success'
    });

    // Load lessons when modal opens
    useEffect(() => {
        if (isOpen && step) {
            loadLessons();
        }
    }, [isOpen, step]);

    const loadLessons = async () => {
        setLoading(true);
        const { notes } = await notesService.fetchNotesForStep(step.id);
        setLessons(notes);
        setLoading(false);
    };

    const handleAddLesson = async () => {
        if (!formData.title.trim()) {
            alert('Please enter a lesson title');
            return;
        }

        const { note, error } = await notesService.createJourneyNote(
            step.id,
            formData,
            formData.result
        );

        if (error) {
            alert('Error creating lesson: ' + error.message);
            return;
        }

        // Add to list
        setLessons([...lessons, note]);

        // Reset form
        setFormData({
            title: '',
            reflection_text: '',
            lesson_learned: '',
            result: step?.status === 'failed' ? 'failed' : 'success'
        });
        setIsAddingNew(false);

        // Notify parent
        if (onUpdate) onUpdate();
    };

    const handleUpdateLesson = async (lessonId) => {
        if (!formData.title.trim()) {
            alert('Please enter a lesson title');
            return;
        }

        const { note, error } = await notesService.updateJourneyNote(
            lessonId,
            formData,
            formData.result
        );

        if (error) {
            alert('Error updating lesson: ' + error.message);
            return;
        }

        // Update in list
        setLessons(lessons.map(l => l.id === lessonId ? note : l));
        setEditingLessonId(null);

        // Reset form
        setFormData({
            title: '',
            reflection_text: '',
            lesson_learned: '',
            result: step?.status === 'failed' ? 'failed' : 'success'
        });

        // Notify parent
        if (onUpdate) onUpdate();
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!confirm('Delete this lesson? This cannot be undone.')) {
            return;
        }

        const { error } = await notesService.deleteJourneyNote(lessonId);

        if (error) {
            alert('Error deleting lesson: ' + error.message);
            return;
        }

        // Remove from list
        setLessons(lessons.filter(l => l.id !== lessonId));

        // Notify parent
        if (onUpdate) onUpdate();
    };

    const startEditing = (lesson) => {
        setEditingLessonId(lesson.id);
        setFormData({
            title: lesson.title,
            reflection_text: lesson.reflection_text || '',
            lesson_learned: lesson.lesson_learned || '',
            result: lesson.result === 'failure' ? 'failed' : lesson.result
        });
        setIsAddingNew(false);
    };

    const cancelEditing = () => {
        setEditingLessonId(null);
        setIsAddingNew(false);
        setFormData({
            title: '',
            reflection_text: '',
            lesson_learned: '',
            result: step?.status === 'failed' ? 'failed' : 'success'
        });
    };

    if (!isOpen || !step) return null;

    const statusIcon = step.status === 'success'
        ? <CheckCircle2 className="text-green-400" size={20} />
        : step.status === 'failed'
        ? <XCircle className="text-red-400" size={20} />
        : null;

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
                    className="bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {statusIcon}
                                <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                            </div>
                            <p className="text-sm text-white/60">
                                Step {step.order_index + 1} • {step.status === 'success' ? 'Success' : step.status === 'failed' ? 'Failed' : 'Pending'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Lessons List */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            📝 Lessons from this step ({lessons.length})
                        </h3>

                        {loading ? (
                            <div className="text-center py-8 text-white/60">
                                Loading lessons...
                            </div>
                        ) : lessons.length === 0 && !isAddingNew ? (
                            <div className="text-center py-8">
                                <p className="text-white/60 mb-4">No lessons yet for this step</p>
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="px-4 py-2 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={16} />
                                    Add First Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id}>
                                        {editingLessonId === lesson.id ? (
                                            // Edit Form
                                            <LessonForm
                                                formData={formData}
                                                setFormData={setFormData}
                                                onSubmit={() => handleUpdateLesson(lesson.id)}
                                                onCancel={cancelEditing}
                                                submitLabel="Save Changes"
                                            />
                                        ) : (
                                            // Lesson Card
                                            <LessonCard
                                                lesson={lesson}
                                                onEdit={() => startEditing(lesson)}
                                                onDelete={() => handleDeleteLesson(lesson.id)}
                                                onShare={() => {
                                                    setSelectedLesson(lesson);
                                                    setShareModalOpen(true);
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Lesson Form */}
                    {isAddingNew && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-4">➕ Add New Lesson</h3>
                            <LessonForm
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleAddLesson}
                                onCancel={cancelEditing}
                                submitLabel="Add Lesson"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!isAddingNew && !editingLessonId && lessons.length > 0 && (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Add Another Lesson
                        </button>
                    )}

                    {/* Lesson Card Export Modal */}
                    <LessonCardExport
                        isOpen={shareModalOpen}
                        onClose={() => setShareModalOpen(false)}
                        lesson={selectedLesson}
                        stepTitle={step?.title}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Lesson Card Component
function LessonCard({ lesson, onEdit, onDelete, onShare }) {
    const isSuccess = lesson.result === 'success';

    return (
        <div className={`p-4 rounded-lg border-2 ${
            isSuccess
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
        }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-1">{lesson.title}</h4>
                    {lesson.lesson_learned && (
                        <p className="text-sm text-white/80 italic mb-2">"{lesson.lesson_learned}"</p>
                    )}
                    {lesson.reflection_text && (
                        <p className="text-sm text-white/60 mb-2">{lesson.reflection_text}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onShare}
                    className="p-2 text-brand-teal hover:bg-brand-teal/10 rounded transition-colors"
                    title="Share this lesson"
                >
                    <Share2 size={16} />
                </button>
                <button
                    onClick={onEdit}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Edit lesson"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    title="Delete lesson"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Lesson Form Component
function LessonForm({ formData, setFormData, onSubmit, onCancel, submitLabel }) {
    return (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-white mb-2">
                    Lesson Title <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Keep it simple"
                    maxLength={60}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                />
                <p className="text-xs text-white/40 mt-1">{formData.title.length}/60</p>
            </div>

            {/* Lesson Learned */}
            <div>
                <label className="block text-sm font-bold text-white mb-2">
                    What did you learn?
                </label>
                <textarea
                    value={formData.lesson_learned}
                    onChange={(e) => setFormData({ ...formData, lesson_learned: e.target.value })}
                    placeholder="The key insight or wisdom gained..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                />
            </div>

            {/* Reflection */}
            <div>
                <label className="block text-sm font-bold text-white mb-2">
                    What happened?
                </label>
                <textarea
                    value={formData.reflection_text}
                    onChange={(e) => setFormData({ ...formData, reflection_text: e.target.value })}
                    placeholder="Context and details..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                />
            </div>

            {/* Result Toggle */}
            <div>
                <label className="block text-sm font-bold text-white mb-2">Result</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFormData({ ...formData, result: 'success' })}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            formData.result === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 text-white/60 border border-white/10'
                        }`}
                    >
                        ✓ Success
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, result: 'failed' })}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            formData.result === 'failed'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 text-white/60 border border-white/10'
                        }`}
                    >
                        ✗ Learning Moment
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={onSubmit}
                    className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg font-bold hover:bg-brand-teal/90 transition-colors"
                >
                    {submitLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
