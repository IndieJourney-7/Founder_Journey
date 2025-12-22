import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useMountain } from '../../context/MountainContext';

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

// Theme colors
const THEMES = {
    startup: {
        name: 'Startup Blue',
        skyGradient: ['#4E6ED0', '#0F1F3D'],
        mountainBase: '#0F1F3D',
        mountainHighlight: '#1a3a6e',
        pathColor: '#E7C778',
        textColor: '#ffffff'
    },
    forest: {
        name: 'Forest Green',
        skyGradient: ['#4ED0A8', '#0F2D25'],
        mountainBase: '#0F2D25',
        mountainHighlight: '#1a6e58',
        pathColor: '#7fcd91',
        textColor: '#ffffff'
    },
    sunset: {
        name: 'Sunset Orange',
        skyGradient: ['#D04E4E', '#2D0F0F'],
        mountainBase: '#2D0F0F',
        mountainHighlight: '#6e1a1a',
        pathColor: '#ffb366',
        textColor: '#ffffff'
    },
    wealth: {
        name: 'Wealth Gold',
        skyGradient: ['#D0B84E', '#1A1A0F'],
        mountainBase: '#1A1A0F',
        mountainHighlight: '#6e621a',
        pathColor: '#E7C778',
        textColor: '#ffffff'
    },
    grayscale: {
        name: 'Minimal Grayscale',
        skyGradient: ['#4A5568', '#1A202C'],
        mountainBase: '#1A202C',
        mountainHighlight: '#2D3748',
        pathColor: '#FFFFFF',
        textColor: '#ffffff'
    }
};

// Professional S-curve mountain path
const SIMPLE_MOUNTAIN_PATH = "M150 850 C 300 800, 400 700, 550 600 C 700 500, 850 400, 1000 300 C 1100 250, 1150 220, 1250 180";

// Calculate point on path at given progress
const getPointOnPath = (pathString, progress) => {
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

export default function MinimalBannerExport({ isOpen, onClose }) {
    const { isPro } = usePlanLimits();
    const { currentMountain, progress, resolvedSteps, totalPlanned } = useMountain();

    // User inputs
    const [missionName, setMissionName] = useState(currentMountain?.title || 'Operation 1-1-12');
    const [goalTarget, setGoalTarget] = useState(currentMountain?.target || '$1k');
    const [currentDay, setCurrentDay] = useState('17');
    const [currentEarnings, setCurrentEarnings] = useState('347');
    const [metricType, setMetricType] = useState('$');
    const [learningQuote, setLearningQuote] = useState('Patience and small steps are winning this week 🌱');
    const [customUrl, setCustomUrl] = useState('shift-journey.vercel.app');

    // Export settings
    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState('startup');
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
    }, [isOpen, selectedFormat, selectedTheme, missionName, goalTarget, currentDay, currentEarnings, metricType, learningQuote, customUrl]);

    const generatePreview = async () => {
        if (!exportRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
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
        link.download = `shift-journey-${formatName}-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    // Calculate climber position on path
    const safeProgress = progress || 0;
    const climberPoint = safeProgress > 0 ? getPointOnPath(SIMPLE_MOUNTAIN_PATH, Math.min(safeProgress, 95)) : { x: 150, y: 850 };
    const peakPoint = { x: 1250, y: 180 };

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
                        className="w-full max-w-7xl bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Shift Journey Banner</h2>
                            <p className="text-white/60">Minimal, shareable export for social media</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left: Controls */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {/* Mission Name */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Mission Name</label>
                                    <input
                                        type="text"
                                        value={missionName}
                                        onChange={(e) => setMissionName(e.target.value.slice(0, 50))}
                                        placeholder="e.g., Operation 1-1-12"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{missionName.length}/50</p>
                                </div>

                                {/* Goal Target */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Goal Target (at peak)</label>
                                    <input
                                        type="text"
                                        value={goalTarget}
                                        onChange={(e) => setGoalTarget(e.target.value.slice(0, 20))}
                                        placeholder="e.g., $1k, Launch MVP"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{goalTarget.length}/20</p>
                                </div>

                                {/* Day & Earnings */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Current Day</label>
                                        <input
                                            type="text"
                                            value={currentDay}
                                            onChange={(e) => setCurrentDay(e.target.value)}
                                            placeholder="17"
                                            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Metric Type</label>
                                        <select
                                            value={metricType}
                                            onChange={(e) => setMetricType(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-teal focus:outline-none"
                                        >
                                            <option value="$">$ (Earnings)</option>
                                            <option value="MRR">MRR</option>
                                            <option value="Users">Users</option>
                                            <option value="Revenue">Revenue</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Current Value</label>
                                    <input
                                        type="text"
                                        value={currentEarnings}
                                        onChange={(e) => setCurrentEarnings(e.target.value)}
                                        placeholder="347"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">Honest numbers build trust (even $0)</p>
                                </div>

                                {/* Learning Quote */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Learning of the Day</label>
                                    <textarea
                                        value={learningQuote}
                                        onChange={(e) => setLearningQuote(e.target.value.slice(0, 150))}
                                        placeholder="e.g., Learning: Patience and small steps are winning this week"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none h-20 resize-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{learningQuote.length}/150</p>
                                </div>

                                {/* Custom URL */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Your Custom URL</label>
                                    <input
                                        type="text"
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                        placeholder="shift-journey.vercel.app"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                </div>

                                {/* Theme Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Theme</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-2 rounded-lg border-2 transition-all ${
                                                    selectedTheme === key ? 'border-brand-teal' : 'border-white/10'
                                                }`}
                                            >
                                                <div
                                                    className="w-full h-8 rounded mb-1"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${thm.skyGradient[0]}, ${thm.skyGradient[1]})`
                                                    }}
                                                />
                                                <div className="text-[10px] font-bold text-white truncate">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Export Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(EXPORT_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-2 rounded-lg border-2 transition-all ${
                                                    selectedFormat === key
                                                        ? 'border-brand-teal bg-brand-teal/10'
                                                        : 'border-white/10 bg-black/20 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-xl mb-1">{fmt.icon}</div>
                                                <div className="text-[10px] font-bold text-white truncate">{fmt.name.split(' ')[0]}</div>
                                                <div className="text-[9px] text-white/40">{fmt.width}×{fmt.height}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating || !previewUrl}
                                    className="w-full py-3 rounded-xl bg-brand-teal text-white font-bold hover:bg-brand-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download HD Banner
                                </button>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">Preview</label>
                                <div className="bg-black/40 rounded-xl border border-white/5 p-4 min-h-[500px] flex items-center justify-center">
                                    {isGenerating ? (
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-white/60 text-sm">Rendering HD export...</p>
                                        </div>
                                    ) : previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Banner Preview"
                                            className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl"
                                        />
                                    ) : (
                                        <p className="text-white/40">Preview will appear here</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Export Renderer */}
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
                                {/* SVG Mountain Container */}
                                <svg
                                    width={format.width}
                                    height={format.height}
                                    viewBox="0 0 1440 900"
                                    preserveAspectRatio="xMidYMid meet"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                >
                                    {/* Multi-layer Mountain for Depth */}
                                    {/* Back layer */}
                                    <path
                                        d="M0 900 L 0 600 L 300 450 L 600 520 L 900 350 L 1200 450 L 1440 400 L 1440 900 Z"
                                        fill={theme.mountainHighlight}
                                        opacity="0.3"
                                    />

                                    {/* Mid layer */}
                                    <path
                                        d="M0 900 L 0 680 L 350 550 L 700 630 L 1050 400 L 1350 480 L 1440 450 L 1440 900 Z"
                                        fill={theme.mountainHighlight}
                                        opacity="0.5"
                                    />

                                    {/* Front Mountain Shape - Main */}
                                    <path
                                        d="M0 900 L 0 750 L 400 600 L 700 680 L 1050 300 L 1300 420 L 1440 380 L 1440 900 Z"
                                        fill={theme.mountainBase}
                                        opacity="0.95"
                                    />

                                    {/* Journey Path - Remaining (dotted) */}
                                    <path
                                        d={SIMPLE_MOUNTAIN_PATH}
                                        stroke="rgba(255, 255, 255, 0.15)"
                                        strokeWidth="4"
                                        strokeDasharray="12 12"
                                        strokeLinecap="round"
                                        fill="none"
                                    />

                                    {/* Journey Path - Completed (solid glowing) */}
                                    <path
                                        d={SIMPLE_MOUNTAIN_PATH}
                                        stroke={theme.pathColor}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray={`${safeProgress * 16} ${1600 - safeProgress * 16}`}
                                        style={{ filter: `drop-shadow(0 0 12px ${theme.pathColor})` }}
                                    />

                                    {/* Climber Dot with glow */}
                                    {safeProgress > 0 && (
                                        <g>
                                            {/* Outer glow */}
                                            <circle
                                                cx={climberPoint.x}
                                                cy={climberPoint.y}
                                                r="22"
                                                fill={theme.pathColor}
                                                opacity="0.3"
                                            />
                                            {/* Main dot */}
                                            <circle
                                                cx={climberPoint.x}
                                                cy={climberPoint.y}
                                                r="14"
                                                fill={theme.pathColor}
                                                stroke="#ffffff"
                                                strokeWidth="3"
                                            />
                                        </g>
                                    )}

                                    {/* Goal Flag at Peak */}
                                    <g>
                                        {/* Flag pole */}
                                        <line
                                            x1={peakPoint.x}
                                            y1={peakPoint.y}
                                            x2={peakPoint.x}
                                            y2={peakPoint.y - 70}
                                            stroke={theme.pathColor}
                                            strokeWidth="5"
                                        />
                                        {/* Flag */}
                                        <path
                                            d={`M ${peakPoint.x},${peakPoint.y - 70} L ${peakPoint.x + 60},${peakPoint.y - 50} L ${peakPoint.x},${peakPoint.y - 30} Z`}
                                            fill={theme.pathColor}
                                            stroke="#ffffff"
                                            strokeWidth="2"
                                        />
                                        {/* Goal text */}
                                        <text
                                            x={peakPoint.x}
                                            y={peakPoint.y - 80}
                                            fill={theme.textColor}
                                            fontSize="26"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.9))' }}
                                        >
                                            {goalTarget}
                                        </text>
                                    </g>
                                </svg>

                                {/* Text Overlays */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        padding: `${format.height * 0.06}px ${format.width * 0.05}px`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                    }}
                                >
                                    {/* Top Section: Mission Name + Stats on LEFT */}
                                    <div style={{ maxWidth: '60%', whiteSpace: 'nowrap' }}>
                                        <h1
                                            style={{
                                                fontSize: `${Math.min(format.width * 0.052, 75)}px`,
                                                fontWeight: '700',
                                                color: theme.textColor,
                                                marginBottom: '10px',
                                                textShadow: '0 4px 16px rgba(0,0,0,0.9)',
                                                letterSpacing: '0.5px',
                                                lineHeight: '1.1',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word',
                                                overflow: 'visible'
                                            }}
                                        >
                                            {missionName}
                                        </h1>
                                        {/* Journey Stats */}
                                        <div
                                            style={{
                                                fontSize: `${Math.min(format.width * 0.015, 20)}px`,
                                                color: 'rgba(255,255,255,0.85)',
                                                fontWeight: '400',
                                                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                                marginTop: '6px',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {resolvedSteps || 0}/{totalPlanned || 0} Steps . {Math.round(progress || 0)}% Complete
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE: Learning Quote - Centered vertically on right */}
                                    {learningQuote && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                right: `${format.width * 0.08}px`,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                padding: '16px 26px',
                                                background: 'rgba(0,0,0,0.7)',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(12px)',
                                                maxWidth: `${format.width * 0.35}px`,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.018, 24)}px`,
                                                    color: theme.textColor,
                                                    margin: 0,
                                                    lineHeight: '1.5',
                                                    fontStyle: 'italic',
                                                    textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {learningQuote}
                                            </p>
                                        </div>
                                    )}

                                    {/* Floating: Day & Earnings - Split Box Design */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: `${format.height * 0.22}px`,
                                            left: `${format.width * 0.04}px`,
                                            background: 'rgba(0,0,0,0.9)',
                                            borderRadius: '8px',
                                            display: 'inline-flex',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                                        }}
                                    >
                                        {/* Day Section */}
                                        <div style={{
                                            padding: '20px 32px',
                                            textAlign: 'center',
                                            borderRight: `3px solid ${theme.pathColor}`
                                        }}>
                                            <div
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.01, 14)}px`,
                                                    color: 'rgba(255,255,255,0.5)',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px'
                                                }}
                                            >
                                                DAY
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.035, 50)}px`,
                                                    fontWeight: '700',
                                                    color: theme.textColor,
                                                    lineHeight: '1',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                                }}
                                            >
                                                {currentDay}
                                            </div>
                                        </div>
                                        {/* Earnings Section */}
                                        <div style={{
                                            padding: '20px 32px',
                                            textAlign: 'center'
                                        }}>
                                            <div
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.01, 14)}px`,
                                                    color: 'rgba(255,255,255,0.5)',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px'
                                                }}
                                            >
                                                {metricType === 'Users' ? 'USERS' : 'EARNED'}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: `${Math.min(format.width * 0.035, 50)}px`,
                                                    fontWeight: '700',
                                                    color: theme.pathColor,
                                                    lineHeight: '1',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                                }}
                                            >
                                                {metricType === '$' || metricType === 'Revenue' ? '$' : ''}{currentEarnings}{metricType !== '$' && metricType !== 'Revenue' && metricType !== 'Users' ? ` ${metricType}` : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Branding */}
                                    <div
                                        style={{
                                            fontSize: `${Math.min(format.width * 0.014, 18)}px`,
                                            color: 'rgba(255,255,255,0.5)',
                                            fontWeight: '500',
                                            textAlign: 'center',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                                        }}
                                    >
                                        Made with Shift Journey • {customUrl}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
