import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Lock, Sparkles, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useMountain } from '../../context/MountainContext';
import { Link } from 'react-router-dom';

const ExportModal = ({ isOpen, onClose, mountainRef }) => {
    const { isPro, limits, checkLimit } = usePlanLimits();
    const { currentMountain, incrementShareCount } = useMountain();
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const shareCount = currentMountain?.share_count || 0;
    const sharesLeft = limits.maxShares - shareCount;
    const canShare = checkLimit('share_count');

    const generateImage = async () => {
        if (!mountainRef.current) return;
        setIsGenerating(true);
        try {
            // Temporarily add watermark element if not Pro
            let watermarkDiv = null;
            if (!isPro) {
                watermarkDiv = document.createElement('div');
                watermarkDiv.innerHTML = `
                    <div style="position: absolute; bottom: 20px; right: 20px; font-weight: bold; color: rgba(255,255,255,0.8); font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 9999;">
                        Built with SFHT Ascent 🏔️
                    </div>
                `;
                mountainRef.current.appendChild(watermarkDiv);
            }

            const canvas = await html2canvas(mountainRef.current, {
                scale: 2, // High res
                useCORS: true,
                backgroundColor: null,
                logging: false
            });
            setPreviewUrl(canvas.toDataURL('image/png'));

            // Remove watermark
            if (watermarkDiv && mountainRef.current.contains(watermarkDiv)) {
                mountainRef.current.removeChild(watermarkDiv);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate preview when opened
    React.useEffect(() => {
        if (isOpen) {
            // Small delay to let modal animate in before capturing
            setTimeout(generateImage, 500);
        }
    }, [isOpen]);

    const handleAction = async (actionType) => {
        if (!isPro && !canShare) return;

        // Increment share count if free user
        if (!isPro) {
            await incrementShareCount();
        }

        if (actionType === 'download') {
            const link = document.createElement('a');
            link.download = `my-ascent-${Date.now()}.png`;
            link.href = previewUrl;
            link.click();
        } else if (actionType === 'share') {
            // In a real app, this would upload to storage and open Twitter intent
            const text = encodeURIComponent(`I'm conquering my goals on SFHT Ascent! 🏔️🚀 ${currentMountain?.title || 'My Journey'} \n\n#BuildInPublic #SaaS`);
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-5xl bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
                            <X size={24} />
                        </button>

                        {/* Preview Area */}
                        <div className="flex-1 bg-black/40 rounded-xl flex items-center justify-center min-h-[300px] relative overflow-hidden border border-white/5 shadow-inner">
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                                    <p className="text-slate-400 text-sm">Generating Preview...</p>
                                </div>
                            ) : previewUrl ? (
                                <img src={previewUrl} alt="Mountain Preview" className="max-w-full max-h-[500px] object-contain shadow-2xl" />
                            ) : (
                                <p className="text-slate-500">Preview failed to load.</p>
                            )}

                            {/* Watermark Banner for Preview */}
                            {!isPro && !isGenerating && (
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white/70 text-sm pointer-events-none">
                                    Includes Watermark (Free Plan)
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="w-full md:w-80 flex flex-col justify-center space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Share Your Climb</h2>
                                <p className="text-slate-400">Inspire others by sharing your progress card.</p>
                            </div>

                            {/* Limits Status */}
                            {!isPro && (
                                <div className={`p-4 rounded-xl border ${!canShare ? 'bg-red-500/10 border-red-500/30' : 'bg-brand-blue/30 border-brand-teal/30'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white/80">Free Plan Usage</span>
                                        <span className={`text-sm font-bold ${!canShare ? 'text-red-400' : 'text-brand-teal'}`}>
                                            {shareCount} / {limits.maxShares} Shares
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${!canShare ? 'bg-red-500' : 'bg-brand-teal'}`}
                                            style={{ width: `${Math.min((shareCount / limits.maxShares) * 100, 100)}%` }}
                                        />
                                    </div>
                                    {!canShare && (
                                        <div className="flex gap-2 mt-3 text-red-300 text-xs items-start">
                                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                            <span>You've reached the share limit for the Free plan. Upgrade to unlock unlimited sharing!</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {(!isPro && !canShare) ? (
                                    <Link
                                        to="/pricing" // Assuming pricing page route
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold shadow-lg hover:shadow-brand-gold/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={20} />
                                        Upgrade to Summit Pro
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction('download')}
                                            disabled={isGenerating}
                                            className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Download size={18} /> Download Image
                                        </button>
                                        <button
                                            onClick={() => handleAction('share')}
                                            disabled={isGenerating}
                                            className="w-full py-3 rounded-xl bg-[#1DA1F2] text-white font-bold hover:bg-[#1a91da] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                        >
                                            <Share2 size={18} /> Share on X
                                        </button>
                                        {!isPro && (
                                            <p className="text-center text-xs text-white/30 mt-2">
                                                This will use 1 of your {limits.maxShares} free shares.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExportModal;
