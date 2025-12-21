import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function FeedbackModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            // Get user email (use logged in user's email or let them type it)
            const email = user?.email || 'anonymous@user.com';

            const { error } = await supabase
                .from('pro_waitlist')
                .insert([{
                    email,
                    feedback: feedback.trim()
                }]);

            if (error) {
                // Check for unique violation (user already on waitlist)
                if (error.code === '23505') {
                    // Update existing entry with new feedback
                    const { error: updateError } = await supabase
                        .from('pro_waitlist')
                        .update({ feedback: feedback.trim() })
                        .eq('email', email);

                    if (updateError) {
                        throw updateError;
                    }
                } else {
                    throw error;
                }
            }

            setStatus('success');
            setFeedback('');

            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Feedback submission error:', error);
            setStatus('error');
            setErrorMessage('Failed to submit feedback. Please try again.');
        }
    };

    const handleClose = () => {
        setFeedback('');
        setStatus('idle');
        setErrorMessage('');
        onClose();
    };

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
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                                <MessageSquare size={24} className="text-brand-teal" />
                            </div>
                        </div>

                        {/* Header */}
                        <h2 className="text-2xl font-bold text-white text-center mb-2">
                            Quick Feedback
                        </h2>
                        <p className="text-white/60 text-sm text-center mb-6">
                            Help us improve SHIFT Ascent! Share your thoughts, ideas, or report issues.
                        </p>

                        {/* Success State */}
                        {status === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-brand-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
                                <p className="text-white/60 text-sm">
                                    Your feedback has been received. We appreciate your help!
                                </p>
                            </motion.div>
                        ) : (
                            /* Feedback Form */
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="What's on your mind? Feature requests, bugs, improvements, anything!"
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none transition-colors min-h-[120px] resize-none text-sm"
                                    required
                                    autoFocus
                                />

                                {status === 'error' && errorMessage && (
                                    <div className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !feedback.trim()}
                                    className="w-full px-6 py-3 rounded-xl bg-brand-teal text-white font-bold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Feedback
                                        </>
                                    )}
                                </button>

                                <p className="text-white/30 text-xs text-center">
                                    Your feedback helps us build a better product for founders like you.
                                </p>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
