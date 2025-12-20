import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useMountain } from '../../context/MountainContext';

// Export format configurations with proper aspect ratios
const EXPORT_FORMATS = {
    twitter: {
        name: 'X (Twitter) Banner',
        width: 1500,
        height: 500,
        ratio: '3:1',
        icon: '𝕏',
        safeZone: { top: 40, right: 60, bottom: 40, left: 60 }
    },
    linkedin: {
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        ratio: '1.91:1',
        icon: 'in',
        safeZone: { top: 50, right: 60, bottom: 50, left: 60 }
    },
    square: {
        name: 'Square Post',
        width: 1080,
        height: 1080,
        ratio: '1:1',
        icon: '□',
        safeZone: { top: 80, right: 80, bottom: 80, left: 80 }
    }
};

// Theme configurations
const THEMES = {
    midnight: {
        name: 'Midnight Blue',
        bg: ['#0F1F3D', '#1a2b4a'],
        mountainLayers: ['#2a3f5f', '#3d5278', '#4a6090'],
        pathColor: '#1CC5A3',
        textColor: '#ffffff',
        accentColor: '#E7C778'
    },
    forest: {
        name: 'Forest Green',
        bg: ['#1a3a2e', '#2d5a4a'],
        mountainLayers: ['#3d6a5a', '#4d7a6a', '#5d8a7a'],
        pathColor: '#7fcd91',
        textColor: '#ffffff',
        accentColor: '#a8e6b0'
    },
    sunset: {
        name: 'Sunset Orange',
        bg: ['#3d1f1f', '#5a3a2d'],
        mountainLayers: ['#6a4a3d', '#7a5a4d', '#8a6a5d'],
        pathColor: '#E7C778',
        textColor: '#ffffff',
        accentColor: '#ffb366'
    },
    charcoal: {
        name: 'Charcoal Dark',
        bg: ['#1a1a1a', '#2d2d2d'],
        mountainLayers: ['#3d3d3d', '#4d4d4d', '#5d5d5d'],
        pathColor: '#888888',
        textColor: '#ffffff',
        accentColor: '#cccccc'
    },
    gradient: {
        name: 'Soft Gradient',
        bg: ['#667eea', '#764ba2'],
        mountainLayers: ['#8b6ec9', '#9b7ed9', '#ab8ee9'],
        pathColor: '#f093fb',
        textColor: '#ffffff',
        accentColor: '#ffc3fd'
    }
};

// Mountain path generator - creates a proper winding path
const generateMountainPath = (width, height, progress) => {
    const startX = width * 0.1;
    const startY = height * 0.85;
    const peakX = width * 0.5;
    const peakY = height * 0.15;
    const endX = width * 0.9;
    const endY = height * 0.4;

    // Create smooth bezier curve path
    return `M ${startX},${startY}
            Q ${width * 0.25},${height * 0.65} ${width * 0.35},${height * 0.50}
            Q ${width * 0.45},${height * 0.35} ${peakX},${peakY}
            Q ${width * 0.55},${height * 0.25} ${width * 0.65},${height * 0.30}
            Q ${width * 0.75},${height * 0.35} ${endX},${endY}`;
};

// Calculate position along path for avatar/markers
const getPositionOnPath = (progress, width, height) => {
    const t = progress / 100;
    const startX = width * 0.1;
    const startY = height * 0.85;
    const peakX = width * 0.5;
    const peakY = height * 0.15;

    // Simplified position calculation (quadratic)
    const x = startX + (peakX - startX) * t * 2 - (peakX - startX) * t * t;
    const y = startY - (startY - peakY) * t * 2 + (startY - peakY) * t * t;

    return { x, y };
};

export default function BannerExportModal({ isOpen, onClose }) {
    const { isPro } = usePlanLimits();
    const { currentMountain, progress, resolvedSteps, totalPlanned } = useMountain();

    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState('midnight');
    const [progressText, setProgressText] = useState('');
    const [showWatermark, setShowWatermark] = useState(!isPro);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const canvasRef = useRef(null);

    const format = EXPORT_FORMATS[selectedFormat];
    const theme = THEMES[selectedTheme];

    // Generate canvas-based export
    useEffect(() => {
        if (isOpen) {
            setTimeout(generateCanvas, 300);
        }
    }, [isOpen, selectedFormat, selectedTheme, progressText, showWatermark]);

    const generateCanvas = () => {
        setIsGenerating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = format;

        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, theme.bg[0]);
        gradient.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw mountain layers (3 layers for depth)
        drawMountainLayer(ctx, width, height, 0.6, theme.mountainLayers[0], 0.2);
        drawMountainLayer(ctx, width, height, 0.5, theme.mountainLayers[1], 0.35);
        drawMountainLayer(ctx, width, height, 0.4, theme.mountainLayers[2], 0.5);

        // Draw journey path
        drawJourneyPath(ctx, width, height, progress, theme.pathColor);

        // Draw avatar on path
        const avatarPos = getPositionOnPath(Math.min(progress, 95), width, height);
        drawAvatar(ctx, avatarPos.x, avatarPos.y, theme.accentColor);

        // Draw goal flag at peak
        const peakPos = { x: width * 0.5, y: height * 0.15 };
        drawGoalFlag(ctx, peakPos.x, peakPos.y, theme.accentColor);

        // Draw text overlay
        drawTextOverlay(ctx, width, height, format, theme);

        // Convert to image
        setPreviewUrl(canvas.toDataURL('image/png'));
        setIsGenerating(false);
    };

    const drawMountainLayer = (ctx, width, height, heightFactor, color, opacity) => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, height);

        // Create jagged mountain peaks
        const peaks = 5;
        for (let i = 0; i <= peaks; i++) {
            const x = (width / peaks) * i;
            const peakHeight = height * heightFactor + Math.random() * height * 0.1;
            ctx.lineTo(x, peakHeight);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const drawJourneyPath = (ctx, width, height, progress, color) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create gradient along path
        const gradient = ctx.createLinearGradient(width * 0.1, 0, width * 0.9, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(progress / 100, color);
        gradient.addColorStop(progress / 100 + 0.01, `${color}40`);
        gradient.addColorStop(1, `${color}20`);
        ctx.strokeStyle = gradient;

        // Draw path
        const path = new Path2D(generateMountainPath(width, height, progress));
        ctx.stroke(path);

        // Draw glow effect on completed portion
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke(path);

        ctx.restore();
    };

    const drawAvatar = (ctx, x, y, color) => {
        ctx.save();
        // Avatar circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    };

    const drawGoalFlag = (ctx, x, y, color) => {
        ctx.save();
        // Flag pole
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 30);
        ctx.stroke();

        // Flag
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 25, y - 22);
        ctx.lineTo(x, y - 14);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const drawTextOverlay = (ctx, width, height, format, theme) => {
        const safe = format.safeZone;

        ctx.save();

        // Mission Title
        ctx.fillStyle = theme.textColor;
        ctx.font = `bold ${Math.min(width * 0.04, 60)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(currentMountain?.title || 'My Journey', safe.left, safe.top + 50);

        // Progress Stats
        ctx.font = `600 ${Math.min(width * 0.02, 28)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.globalAlpha = 0.9;
        ctx.fillText(`${resolvedSteps}/${totalPlanned} Steps • ${Math.round(progress)}% Complete`, safe.left, safe.top + 85);

        // Progress Highlight (if provided)
        if (progressText) {
            ctx.globalAlpha = 1;
            ctx.font = `900 ${Math.min(width * 0.06, 90)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillStyle = theme.accentColor;
            ctx.shadowBlur = 20;

            // Center the text
            const textWidth = ctx.measureText(progressText).width;
            const centerX = width / 2 - textWidth / 2;
            const centerY = height / 2;

            // Background box
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 0;
            ctx.fillRect(centerX - 30, centerY - 60, textWidth + 60, 100);

            // Text
            ctx.fillStyle = theme.accentColor;
            ctx.shadowBlur = 20;
            ctx.fillText(progressText, centerX, centerY + 10);
        }

        // Watermark
        if (showWatermark) {
            ctx.globalAlpha = 0.5;
            ctx.font = `600 ${Math.min(width * 0.015, 22)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillStyle = theme.textColor;
            ctx.shadowBlur = 5;
            ctx.textAlign = 'right';
            ctx.fillText('Built with Mountain Journey', width - safe.right, height - safe.bottom);
        }

        ctx.restore();
    };

    const handleDownload = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        const formatName = format.name.replace(/[^a-zA-Z0-9]/g, '-');
        link.download = `mountain-journey-${formatName}-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

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
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Progress Banner</h2>
                            <p className="text-white/60">Professional social media banners for your journey</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Controls */}
                            <div className="space-y-6">
                                {/* Format Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Export Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(EXPORT_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedFormat === key
                                                        ? 'border-brand-teal bg-brand-teal/10'
                                                        : 'border-white/10 bg-black/20 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{fmt.icon}</div>
                                                <div className="text-xs font-bold text-white">{fmt.name.split(' ')[0]}</div>
                                                <div className="text-[10px] text-white/40">{fmt.ratio}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Theme</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedTheme === key ? 'border-brand-teal' : 'border-white/10'
                                                }`}
                                            >
                                                <div
                                                    className="w-full h-12 rounded mb-2"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${thm.bg[0]}, ${thm.bg[1]})`
                                                    }}
                                                />
                                                <div className="text-xs font-bold text-white">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress Text */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">
                                        Highlight Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={progressText}
                                        onChange={(e) => setProgressText(e.target.value.slice(0, 30))}
                                        placeholder="e.g., Day 17, $5K MRR"
                                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{progressText.length}/30 characters</p>
                                </div>

                                {/* Watermark Toggle */}
                                {isPro && (
                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                                        <div>
                                            <div className="text-sm font-bold text-white">Show Watermark</div>
                                            <div className="text-xs text-white/50">Pro: Hide branding</div>
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

                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating || !previewUrl}
                                    className="w-full py-4 rounded-xl bg-brand-teal text-white font-bold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download Banner
                                </button>
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">Preview</label>
                                <div className="bg-black/40 rounded-xl border border-white/5 p-4 min-h-[400px] flex items-center justify-center">
                                    {isGenerating ? (
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-white/60 text-sm">Generating...</p>
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

                        {/* Hidden Canvas */}
                        <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
