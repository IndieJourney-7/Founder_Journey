import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useMountain } from '../../context/MountainContext';

// Banner format configurations
const BANNER_FORMATS = {
    twitter: { name: 'X (Twitter) Banner', width: 1500, height: 500, icon: '𝕏' },
    linkedin: { name: 'LinkedIn Banner', width: 1584, height: 396, icon: 'in' },
    square: { name: 'Post / Square', width: 1080, height: 1080, icon: '□' }
};

// Theme configurations
const THEMES = {
    midnight: {
        name: 'Midnight Blue',
        bg: 'linear-gradient(135deg, #0F1F3D 0%, #1a2b4a 100%)',
        mountainColor: '#2a3f5f',
        pathColor: '#1CC5A3',
        textColor: '#ffffff'
    },
    forest: {
        name: 'Forest Green',
        bg: 'linear-gradient(135deg, #1a3a2e 0%, #2d5a4a 100%)',
        mountainColor: '#3d6a5a',
        pathColor: '#7fcd91',
        textColor: '#ffffff'
    },
    sunset: {
        name: 'Sunset Orange',
        bg: 'linear-gradient(135deg, #3d1f1f 0%, #5a3a2d 100%)',
        mountainColor: '#6a4a3d',
        pathColor: '#E7C778',
        textColor: '#ffffff'
    },
    charcoal: {
        name: 'Charcoal Dark',
        bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        mountainColor: '#3d3d3d',
        pathColor: '#888888',
        textColor: '#ffffff'
    },
    gradient: {
        name: 'Soft Gradient',
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        mountainColor: '#8b6ec9',
        pathColor: '#f093fb',
        textColor: '#ffffff'
    }
};

export default function BannerExportModal({ isOpen, onClose, mountainRef }) {
    const { isPro } = usePlanLimits();
    const { currentMountain, progress, resolvedSteps, totalPlanned } = useMountain();

    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState('midnight');
    const [progressText, setProgressText] = useState('');
    const [showWatermark, setShowWatermark] = useState(!isPro);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const bannerRef = useRef(null);

    // Generate preview when modal opens or settings change
    useEffect(() => {
        if (isOpen) {
            setTimeout(generatePreview, 300);
        }
    }, [isOpen, selectedFormat, selectedTheme, progressText, showWatermark]);

    const generatePreview = async () => {
        if (!bannerRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(bannerRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                width: BANNER_FORMATS[selectedFormat].width,
                height: BANNER_FORMATS[selectedFormat].height
            });
            setPreviewUrl(canvas.toDataURL('image/png'));
        } catch (error) {
            console.error('Preview generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!previewUrl) return;

        const link = document.createElement('a');
        const formatName = BANNER_FORMATS[selectedFormat].name.replace(/[^a-zA-Z0-9]/g, '-');
        link.download = `mountain-journey-${formatName}-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    const format = BANNER_FORMATS[selectedFormat];
    const theme = THEMES[selectedTheme];
    const aspectRatio = format.width / format.height;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-6xl bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
                        >
                            <X size={24} />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Progress Banner</h2>
                            <p className="text-white/60">Design a shareable banner for social platforms</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left: Controls */}
                            <div className="space-y-6">
                                {/* Format Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Banner Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(BANNER_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                                    selectedFormat === key
                                                        ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                                                        : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{fmt.icon}</div>
                                                <div className="text-xs font-bold">{fmt.name.split(' ')[0]}</div>
                                                <div className="text-[10px] text-white/40">{fmt.width}×{fmt.height}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Background Theme</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedTheme === key
                                                        ? 'border-brand-teal'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div
                                                    className="w-full h-12 rounded mb-2"
                                                    style={{ background: thm.bg }}
                                                />
                                                <div className="text-xs font-bold text-white">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress Highlight Text */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">
                                        Highlight Your Progress (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={progressText}
                                        onChange={(e) => setProgressText(e.target.value.slice(0, 50))}
                                        placeholder="e.g., Day 17, $120 earned, 33% complete"
                                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        maxLength={50}
                                    />
                                    <p className="text-xs text-white/40 mt-1">
                                        {progressText.length}/50 characters
                                    </p>
                                </div>

                                {/* Watermark Toggle */}
                                {isPro && (
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                                        <div>
                                            <div className="text-sm font-bold text-white">Show Watermark</div>
                                            <div className="text-xs text-white/50">Pro feature: Hide branding</div>
                                        </div>
                                        <button
                                            onClick={() => setShowWatermark(!showWatermark)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${
                                                showWatermark ? 'bg-brand-teal' : 'bg-white/20'
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                    showWatermark ? 'left-0.5' : 'left-6'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                )}

                                {!isPro && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-sm text-yellow-200">
                                            💡 Upgrade to Pro to remove the watermark
                                        </p>
                                    </div>
                                )}

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating || !previewUrl}
                                    className="w-full py-4 rounded-xl bg-brand-teal text-white font-bold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download Banner
                                </button>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">Preview</label>
                                <div className="bg-black/40 rounded-xl border border-white/5 p-4 min-h-[400px] flex items-center justify-center">
                                    {isGenerating ? (
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-white/60 text-sm">Generating preview...</p>
                                        </div>
                                    ) : previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Banner Preview"
                                            className="max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl"
                                        />
                                    ) : (
                                        <p className="text-white/40">Preview will appear here</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Banner Generator */}
                        <div className="absolute opacity-0 pointer-events-none" style={{ left: -9999 }}>
                            <div
                                ref={bannerRef}
                                style={{
                                    width: `${format.width}px`,
                                    height: `${format.height}px`,
                                    background: theme.bg,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Mountain Graphic */}
                                <svg
                                    width={format.width}
                                    height={format.height}
                                    style={{ position: 'absolute', bottom: 0, left: 0 }}
                                    viewBox={`0 0 ${format.width} ${format.height}`}
                                    preserveAspectRatio="xMidYMax slice"
                                >
                                    {/* Mountain Peaks */}
                                    <path
                                        d={`M 0,${format.height} L 0,${format.height * 0.6} L ${format.width * 0.3},${format.height * 0.3} L ${format.width * 0.5},${format.height * 0.5} L ${format.width * 0.7},${format.height * 0.2} L ${format.width},${format.height * 0.4} L ${format.width},${format.height} Z`}
                                        fill={theme.mountainColor}
                                        opacity="0.6"
                                    />

                                    {/* Winding Path */}
                                    <path
                                        d={`M 50,${format.height - 50} Q ${format.width * 0.25},${format.height * 0.7} ${format.width * 0.5},${format.height * 0.55} T ${format.width * 0.75},${format.height * 0.35}`}
                                        stroke={theme.pathColor}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${progress * 10} ${1000 - progress * 10}`}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Content Overlay */}
                                <div style={{ position: 'absolute', inset: 0, padding: format.width * 0.05 }}>
                                    {/* Mission Title */}
                                    <div style={{
                                        fontSize: format.width * 0.04,
                                        fontWeight: 'bold',
                                        color: theme.textColor,
                                        marginBottom: format.height * 0.02,
                                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                    }}>
                                        {currentMountain?.title || 'My Journey'}
                                    </div>

                                    {/* Progress Stats */}
                                    <div style={{
                                        fontSize: format.width * 0.025,
                                        color: theme.textColor,
                                        opacity: 0.8,
                                        textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                                    }}>
                                        {resolvedSteps}/{totalPlanned} Steps • {Math.round(progress)}% Complete
                                    </div>

                                    {/* Progress Highlight Text */}
                                    {progressText && (
                                        <div style={{
                                            position: 'absolute',
                                            top: format.height * 0.35,
                                            left: format.width * 0.5,
                                            transform: 'translateX(-50%)',
                                            fontSize: format.width * 0.06,
                                            fontWeight: 'bold',
                                            color: theme.pathColor,
                                            textShadow: '0 4px 12px rgba(0,0,0,0.7)',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {progressText}
                                        </div>
                                    )}

                                    {/* Watermark */}
                                    {showWatermark && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: format.height * 0.05,
                                            right: format.width * 0.05,
                                            fontSize: format.width * 0.015,
                                            color: theme.textColor,
                                            opacity: 0.4,
                                            fontWeight: '500'
                                        }}>
                                            Built with Mountain Journey
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
