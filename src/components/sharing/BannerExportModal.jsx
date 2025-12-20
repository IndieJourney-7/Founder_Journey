import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useMountain } from '../../context/MountainContext';

// EXACT path from WindingPath.jsx - DO NOT MODIFY
const JOURNEY_PATH = "M200 850 C 350 850, 450 750, 500 650 C 550 550, 450 500, 600 450 C 750 400, 900 500, 1000 400 C 1100 300, 1150 280, 1200 250";

// EXACT mountain layer paths from MountainBackground.jsx - DO NOT MODIFY
const MOUNTAIN_LAYERS = {
    background: "M0 900L0 500C150 480 300 350 450 400C600 450 750 250 900 300C1050 350 1200 400 1440 350V900H0Z",
    midground: "M-100 900L-100 600C100 580 300 450 500 550C700 650 900 400 1100 500C1300 600 1500 550 1600 900H-100Z",
    foreground: "M0 900L0 800C200 750 400 600 600 650C800 700 1000 200 1200 250C1350 287.5 1440 400 1440 900H0Z"
};

// Theme colors from MountainBackground.jsx
const THEMES = {
    startup: {
        name: 'Startup Blue',
        skyGradient: ['#4E6ED0', '#0F1F3D'],
        mountains: {
            back: '#1a3a6e',
            mid: '#152c5b',
            frontStart: '#2A4A8A',
            frontEnd: '#0F1F3D'
        },
        pathColor: '#E7C778',
        textColor: '#ffffff'
    },
    forest: {
        name: 'Forest Green',
        skyGradient: ['#4ED0A8', '#0F2D25'],
        mountains: {
            back: '#1a6e58',
            mid: '#155b48',
            frontStart: '#2A8A70',
            frontEnd: '#0F2D25'
        },
        pathColor: '#7fcd91',
        textColor: '#ffffff'
    },
    sunset: {
        name: 'Sunset Orange',
        skyGradient: ['#D04E4E', '#2D0F0F'],
        mountains: {
            back: '#6e1a1a',
            mid: '#5b1515',
            frontStart: '#8A2A2A',
            frontEnd: '#2D0F0F'
        },
        pathColor: '#ffb366',
        textColor: '#ffffff'
    },
    wealth: {
        name: 'Wealth Gold',
        skyGradient: ['#D0B84E', '#1A1A0F'],
        mountains: {
            back: '#6e621a',
            mid: '#5b5115',
            frontStart: '#8A7A2A',
            frontEnd: '#1A1A0F'
        },
        pathColor: '#E7C778',
        textColor: '#ffffff'
    }
};

// Export format configurations
const EXPORT_FORMATS = {
    twitter: {
        name: 'X (Twitter) Banner',
        width: 1500,
        height: 500,
        icon: '𝕏'
    },
    linkedin: {
        name: 'LinkedIn Banner',
        width: 1584,
        height: 396,
        icon: 'in'
    },
    square: {
        name: 'Square Post',
        width: 1200,
        height: 1200,
        icon: '□'
    }
};

// Calculate point on path at given progress
const getPointOnPath = (pathString, progress) => {
    // Create temporary SVG to measure path
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathString);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const pathLength = path.getTotalLength();
    const point = path.getPointAtLength((progress / 100) * pathLength);

    document.body.removeChild(svg);
    return point;
};

export default function BannerExportModal({ isOpen, onClose }) {
    const { isPro } = usePlanLimits();
    const { currentMountain, progress, resolvedSteps, totalPlanned } = useMountain();

    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState('startup');
    const [progressText, setProgressText] = useState('');
    const [showWatermark, setShowWatermark] = useState(!isPro);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const exportRef = useRef(null);

    const format = EXPORT_FORMATS[selectedFormat];
    const theme = THEMES[selectedTheme];

    // Generate preview when settings change
    useEffect(() => {
        if (isOpen && exportRef.current) {
            setTimeout(generatePreview, 500);
        }
    }, [isOpen, selectedFormat, selectedTheme, progressText, showWatermark]);

    const generatePreview = async () => {
        if (!exportRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 2, // 2x for HD quality
                useCORS: true,
                backgroundColor: null,
                logging: false,
                width: format.width,
                height: format.height
            });

            setPreviewUrl(canvas.toDataURL('image/png'));
        } catch (error) {
            console.error('Export generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        const formatName = format.name.replace(/[^a-zA-Z0-9]/g, '-');
        link.download = `mountain-journey-${formatName}-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    // Calculate avatar position on path
    const avatarPoint = progress > 0 ? getPointOnPath(JOURNEY_PATH, Math.min(progress, 95)) : { x: 200, y: 850 };
    const peakPoint = { x: 1200, y: 250 }; // End of path (summit)

    // Scale factor to fit 1440x900 viewBox into export dimensions
    const scaleX = format.width / 1440;
    const scaleY = format.height / 900;
    const scale = Math.min(scaleX, scaleY);

    // Calculate safe zones
    const safeZone = {
        top: format.height * 0.08,
        right: format.width * 0.06,
        bottom: format.height * 0.08,
        left: format.width * 0.06
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
                            <h2 className="text-3xl font-bold text-white mb-2">Export Journey Banner</h2>
                            <p className="text-white/60">High-fidelity export of your mountain journey</p>
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
                                                <div className="text-xs font-bold text-white truncate">{fmt.name.split(' ')[0]}</div>
                                                <div className="text-[10px] text-white/40">{fmt.width}×{fmt.height}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Theme</label>
                                    <div className="grid grid-cols-2 gap-2">
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
                                                        background: `linear-gradient(135deg, ${thm.skyGradient[0]}, ${thm.skyGradient[1]})`
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
                                        Progress Highlight (Optional)
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
                                            <div className="text-sm font-bold text-white">Watermark</div>
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
                                    Download HD Banner
                                </button>
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">Preview</label>
                                <div className="bg-black/40 rounded-xl border border-white/5 p-4 min-h-[400px] flex items-center justify-center">
                                    {isGenerating ? (
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-white/60 text-sm">Rendering HD export...</p>
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

                        {/* Hidden Export Renderer - EXACT faithful reproduction */}
                        <div className="absolute opacity-0 pointer-events-none" style={{ left: -99999 }}>
                            <div
                                ref={exportRef}
                                style={{
                                    width: `${format.width}px`,
                                    height: `${format.height}px`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: `linear-gradient(180deg, ${theme.skyGradient[0]} 0%, ${theme.skyGradient[1]} 100%)`
                                }}
                            >
                                {/* SVG Mountain + Path Container */}
                                <svg
                                    width={format.width}
                                    height={format.height}
                                    viewBox="0 0 1440 900"
                                    preserveAspectRatio="xMidYMid meet"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                >
                                    {/* Exact Mountain Layers */}
                                    <path
                                        d={MOUNTAIN_LAYERS.background}
                                        fill={theme.mountains.back}
                                        fillOpacity="0.4"
                                    />
                                    <path
                                        d={MOUNTAIN_LAYERS.midground}
                                        fill={theme.mountains.mid}
                                        fillOpacity="0.7"
                                    />
                                    <defs>
                                        <linearGradient id="exportMountainGradient" x1="720" y1="200" x2="720" y2="900">
                                            <stop offset="0%" stopColor={theme.mountains.frontStart} />
                                            <stop offset="100%" stopColor={theme.mountains.frontEnd} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={MOUNTAIN_LAYERS.foreground}
                                        fill="url(#exportMountainGradient)"
                                    />

                                    {/* Exact Journey Path - Base (dotted) */}
                                    <path
                                        d={JOURNEY_PATH}
                                        stroke="rgba(231, 199, 120, 0.3)"
                                        strokeWidth="4"
                                        strokeDasharray="10 10"
                                        strokeLinecap="round"
                                        fill="none"
                                    />

                                    {/* Exact Journey Path - Progress (solid) */}
                                    <path
                                        d={JOURNEY_PATH}
                                        stroke={theme.pathColor}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray={`${progress * 20} ${2000 - progress * 20}`}
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(231, 199, 120, 0.6))' }}
                                    />

                                    {/* Avatar on Path */}
                                    {progress > 0 && (
                                        <g>
                                            <circle
                                                cx={avatarPoint.x}
                                                cy={avatarPoint.y}
                                                r="18"
                                                fill={theme.pathColor}
                                                stroke="#ffffff"
                                                strokeWidth="4"
                                            />
                                        </g>
                                    )}

                                    {/* Goal Flag at Summit */}
                                    <g>
                                        {/* Flag pole */}
                                        <line
                                            x1={peakPoint.x}
                                            y1={peakPoint.y}
                                            x2={peakPoint.x}
                                            y2={peakPoint.y - 50}
                                            stroke={theme.pathColor}
                                            strokeWidth="4"
                                        />
                                        {/* Flag */}
                                        <path
                                            d={`M ${peakPoint.x},${peakPoint.y - 50} L ${peakPoint.x + 40},${peakPoint.y - 35} L ${peakPoint.x},${peakPoint.y - 20} Z`}
                                            fill={theme.pathColor}
                                        />
                                        {/* Goal text */}
                                        <text
                                            x={peakPoint.x}
                                            y={peakPoint.y - 60}
                                            fill={theme.textColor}
                                            fontSize="20"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
                                        >
                                            {currentMountain?.target || 'Goal'}
                                        </text>
                                    </g>
                                </svg>

                                {/* Text Overlay */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        padding: `${safeZone.top}px ${safeZone.right}px ${safeZone.bottom}px ${safeZone.left}px`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {/* Top: Mission Title & Stats */}
                                    <div>
                                        <h1
                                            style={{
                                                fontSize: `${Math.min(format.width * 0.04, 60)}px`,
                                                fontWeight: 'bold',
                                                color: theme.textColor,
                                                marginBottom: '8px',
                                                textShadow: '0 3px 10px rgba(0,0,0,0.8)',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            }}
                                        >
                                            {currentMountain?.title || 'My Journey'}
                                        </h1>
                                        <p
                                            style={{
                                                fontSize: `${Math.min(format.width * 0.02, 28)}px`,
                                                color: theme.textColor,
                                                opacity: 0.9,
                                                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                                                fontWeight: '600',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            }}
                                        >
                                            {resolvedSteps}/{totalPlanned} Steps • {Math.round(progress)}% Complete
                                        </p>
                                    </div>

                                    {/* Center: Progress Highlight */}
                                    {progressText && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                padding: '20px 40px',
                                                background: 'rgba(0,0,0,0.5)',
                                                borderRadius: '16px',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.06, 90)}px`,
                                                    fontWeight: '900',
                                                    color: theme.pathColor,
                                                    textShadow: `0 6px 20px rgba(0,0,0,0.9)`,
                                                    whiteSpace: 'nowrap',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                                }}
                                            >
                                                {progressText}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom: Watermark */}
                                    {showWatermark && (
                                        <div
                                            style={{
                                                fontSize: `${Math.min(format.width * 0.015, 22)}px`,
                                                color: theme.textColor,
                                                opacity: 0.5,
                                                fontWeight: '600',
                                                textAlign: 'right',
                                                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            }}
                                        >
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
