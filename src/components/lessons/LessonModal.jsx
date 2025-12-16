import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Lock, Globe } from 'lucide-react';

const LessonModal = ({ isOpen, onClose, onSave, initialData = {}, stepTitle }) => {
    const [formData, setFormData] = useState({
        content: '',
        details: '',
        next_action: '',
        tags: '',
        visibility: 'private'
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                content: initialData.content || '',
                details: initialData.details || '',
                next_action: initialData.next_action || '',
                tags: initialData.tags ? initialData.tags.join(', ') : '',
                visibility: initialData.visibility || 'private'
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
    };

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
                        className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Texture */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -z-10" />

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">What did you learn?</h3>
                                <p className="text-sm text-slate-400 mt-1">Reflecting on: <span className="text-brand-gold">{stepTitle}</span></p>
                            </div>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/80">One-line Lesson <span className="text-red-400">*</span></label>
                                <input
                                    required
                                    maxLength={300}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-white placeholder-white/30"
                                    placeholder="e.g. Improve CTA clarity"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/80">Details & Insights</label>
                                <textarea
                                    maxLength={2000}
                                    value={formData.details}
                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none h-24 resize-none text-white placeholder-white/30"
                                    placeholder="What went wrong? What was the root cause?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white/80">Next Action</label>
                                <input
                                    value={formData.next_action}
                                    onChange={e => setFormData({ ...formData, next_action: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-white placeholder-white/30"
                                    placeholder="What will you try next?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/80">Tags</label>
                                    <input
                                        value={formData.tags}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-white placeholder-white/30"
                                        placeholder="marketing, cta, fail"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/80">Visibility</label>
                                    <div className="flex bg-black/20 rounded-lg p-1 border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: 'private' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${formData.visibility === 'private' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Lock size={14} /> Private
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: 'public' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${formData.visibility === 'public' ? 'bg-brand-teal text-brand-blue shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Globe size={14} /> Public
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 rounded-lg bg-brand-gold text-brand-blue font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
                                >
                                    <Save size={18} /> Save Lesson
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LessonModal;
