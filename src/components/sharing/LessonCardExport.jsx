import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

// Export format configurations for social media
const EXPORT_FORMATS = {
    instagram_story: {
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        icon: '📱'
    },
    instagram_square: {
        name: 'Instagram Square',
        width: 1080,
        height: 1080,
        icon: '□'
    },
    twitter: {
        name: 'X (Twitter) Post',
        width: 1200,
        height: 675,
        icon: '𝕏'
    },
    linkedin: {
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        icon: 'in'
    }
};

// Theme colors for lesson cards
const THEMES = {
    success_emerald: {
        name: 'Success Green',
        gradient: ['#10B981', '#065F46'],
        accentColor: '#34D399',
        textColor: '#ffffff',
        icon: <CheckCircle size={48} />
    },
    success_teal: {
        name: 'Teal Victory',
        gradient: ['#14B8A6', '#0F766E'],
        accentColor: '#5EEAD4',
        textColor: '#ffffff',
        icon: <CheckCircle size={48} />
    },
    learning_amber: {
        name: 'Learning Gold',
        gradient: ['#F59E0B', '#92400E'],
        accentColor: '#FCD34D',
        textColor: '#ffffff',
        icon: <Lightbulb size={48} />
    },
    learning_orange: {
        name: 'Growth Orange',
        gradient: ['#F97316', '#9A3412'],
        accentColor: '#FDBA74',
        textColor: '#ffffff',
        icon: <Lightbulb size={48} />
    },
    minimal_dark: {
        name: 'Minimal Dark',
        gradient: ['#1F2937', '#111827'],
        accentColor: '#E7C778',
        textColor: '#ffffff',
        icon: <Lightbulb size={48} />
    },
    elegant_purple: {
        name: 'Elegant Purple',
        gradient: ['#8B5CF6', '#5B21B6'],
        accentColor: '#C4B5FD',
        textColor: '#ffffff',
        icon: <Lightbulb size={48} />
    }
};

// Font options
const FONT_OPTIONS = {
    'Editorial': '"Crimson Pro", "Libre Baskerville", Georgia, serif',
    'Technical': '"IBM Plex Mono", "Courier Prime", "Courier New", monospace',
    'Geometric': '"DM Sans", "Work Sans", system-ui, sans-serif',
    'Grotesque': '"Darker Grotesque", "Archivo", -apple-system, sans-serif',
    'Display': '"Fraunces", "Playfair Display", Georgia, serif',
    'Modern': '"Manrope", "Inter", system-ui, sans-serif'
};

export default function LessonCardExport({ isOpen, onClose, lesson, stepTitle }) {
    if (!lesson) return null;

    const isSuccess = lesson.result === 'success';

    // User inputs
    const [title, setTitle] = useState(lesson.title || '');
    const [lessonText, setLessonText] = useState(lesson.lesson_learned || '');
    const [context, setContext] = useState(lesson.reflection_text || '');
    const [showContext, setShowContext] = useState(false);
    const [showStepTitle, setShowStepTitle] = useState(true);
    const [showDate, setShowDate] = useState(true);
    const [customTag, setCustomTag] = useState('');
    const [customUrl, setCustomUrl] = useState('shift-journey.vercel.app');

    // Export settings
    const [selectedFormat, setSelectedFormat] = useState('instagram_square');
    const [selectedTheme, setSelectedTheme] = useState(isSuccess ? 'success_emerald' : 'learning_amber');
    const [titleFont, setTitleFont] = useState('Display');
    const [quoteFont, setQuoteFont] = useState('Editorial');
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
    }, [isOpen, selectedFormat, selectedTheme, title, lessonText, context, showContext, showStepTitle, showDate, customTag, customUrl, titleFont, quoteFont]);

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
        link.download = `lesson-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
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
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-7xl bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Share Your Lesson</h2>
                            <p className="text-white/60">Create a beautiful quote card for social media</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left: Controls */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {/* Lesson Title */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                                        placeholder="e.g., Keep it simple"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{title.length}/60</p>
                                </div>

                                {/* Lesson Text */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Main Lesson</label>
                                    <textarea
                                        value={lessonText}
                                        onChange={(e) => setLessonText(e.target.value.slice(0, 200))}
                                        placeholder="The key insight or wisdom gained..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{lessonText.length}/200</p>
                                </div>

                                {/* Context (Optional) */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-white">Context (Optional)</label>
                                        <label className="flex items-center gap-2 text-xs text-white/60">
                                            <input
                                                type="checkbox"
                                                checked={showContext}
                                                onChange={(e) => setShowContext(e.target.checked)}
                                                className="rounded"
                                            />
                                            Show on card
                                        </label>
                                    </div>
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value.slice(0, 150))}
                                        placeholder="What happened..."
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                                    />
                                    <p className="text-xs text-white/40 mt-1">{context.length}/150</p>
                                </div>

                                {/* Format Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(EXPORT_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${selectedFormat === key
                                                    ? 'border-brand-teal bg-brand-teal/10 text-white'
                                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">{fmt.icon}</div>
                                                <div className="text-xs font-bold">{fmt.name}</div>
                                                <div className="text-[10px] text-white/40">{fmt.width}x{fmt.height}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Theme</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${selectedTheme === key
                                                    ? 'border-brand-teal text-white'
                                                    : 'border-white/10 text-white/60 hover:border-white/20'
                                                    }`}
                                                style={{
                                                    background: selectedTheme === key
                                                        ? `linear-gradient(135deg, ${thm.gradient[0]}, ${thm.gradient[1]})`
                                                        : 'rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div className="text-xs font-bold">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Title Font</label>
                                    <select
                                        value={titleFont}
                                        onChange={(e) => setTitleFont(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-teal focus:outline-none"
                                    >
                                        {Object.keys(FONT_OPTIONS).map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Quote Font</label>
                                    <select
                                        value={quoteFont}
                                        onChange={(e) => setQuoteFont(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-brand-teal focus:outline-none"
                                    >
                                        {Object.keys(FONT_OPTIONS).map(font => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display Options */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={showStepTitle}
                                            onChange={(e) => setShowStepTitle(e.target.checked)}
                                            className="rounded"
                                        />
                                        Show step title ({stepTitle})
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-white/80">
                                        <input
                                            type="checkbox"
                                            checked={showDate}
                                            onChange={(e) => setShowDate(e.target.checked)}
                                            className="rounded"
                                        />
                                        Show date
                                    </label>
                                </div>

                                {/* Custom Tag */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Custom Tag (Optional)</label>
                                    <input
                                        type="text"
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value.slice(0, 30))}
                                        placeholder="e.g., Day 17, Week 3, etc."
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                </div>

                                {/* Custom URL */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Website URL</label>
                                    <input
                                        type="text"
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value.slice(0, 50))}
                                        placeholder="your-site.com"
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                    />
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    disabled={!previewUrl || isGenerating}
                                    className="w-full py-3 bg-brand-teal text-brand-blue font-bold rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    {isGenerating ? 'Generating...' : 'Download Image'}
                                </button>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Preview</label>
                                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full rounded-lg shadow-2xl" />
                                    ) : (
                                        <div className="aspect-square flex items-center justify-center text-white/30">
                                            Generating preview...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Export Canvas */}
                        <div className="absolute -left-[9999px] top-0">
                            <div
                                ref={exportRef}
                                style={{
                                    width: `${format.width}px`,
                                    height: `${format.height}px`,
                                    background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    fontFamily: FONT_OPTIONS[quoteFont]
                                }}
                            >
                                {/* Decorative Elements */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10%',
                                    right: '10%',
                                    width: '40%',
                                    height: '40%',
                                    background: `radial-gradient(circle, ${theme.accentColor}20, transparent)`,
                                    borderRadius: '50%',
                                    filter: 'blur(80px)'
                                }} />

                                {/* Content Container */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: selectedFormat === 'instagram_story' ? '100px 60px' : '60px',
                                    textAlign: 'center'
                                }}>
                                    {/* Icon */}
                                    <div style={{ color: theme.accentColor, marginBottom: '24px', opacity: 0.9 }}>
                                        {theme.icon}
                                    </div>

                                    {/* Title */}
                                    {title && (
                                        <h2 style={{
                                            fontFamily: FONT_OPTIONS[titleFont],
                                            fontSize: selectedFormat === 'instagram_story' ? '52px' : '40px',
                                            fontWeight: 'bold',
                                            color: theme.textColor,
                                            marginBottom: '28px',
                                            lineHeight: '1.2',
                                            maxWidth: '85%',
                                            textAlign: 'center'
                                        }}>
                                            {title}
                                        </h2>
                                    )}

                                    {/* Main Lesson Quote */}
                                    {lessonText && (
                                        <blockquote style={{
                                            fontFamily: FONT_OPTIONS[quoteFont],
                                            fontSize: selectedFormat === 'instagram_story' ? '30px' : '24px',
                                            fontStyle: 'italic',
                                            color: theme.textColor,
                                            marginBottom: showContext && context ? '24px' : '40px',
                                            lineHeight: '1.5',
                                            maxWidth: '80%',
                                            opacity: 0.95,
                                            textAlign: 'center'
                                        }}>
                                            "{lessonText}"
                                        </blockquote>
                                    )}

                                    {/* Context */}
                                    {showContext && context && (
                                        <p style={{
                                            fontFamily: FONT_OPTIONS[quoteFont],
                                            fontSize: selectedFormat === 'instagram_story' ? '20px' : '16px',
                                            color: theme.textColor,
                                            marginBottom: '40px',
                                            lineHeight: '1.4',
                                            maxWidth: '75%',
                                            opacity: 0.7,
                                            textAlign: 'center'
                                        }}>
                                            {context}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        {/* Step Title & Date */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            fontSize: selectedFormat === 'instagram_story' ? '16px' : '13px',
                                            color: theme.textColor,
                                            opacity: 0.6,
                                            textAlign: 'center'
                                        }}>
                                            {showStepTitle && stepTitle && <span>From: {stepTitle}</span>}
                                            {showDate && showStepTitle && stepTitle && <span>•</span>}
                                            {showDate && <span>{new Date(lesson.created_at).toLocaleDateString()}</span>}
                                        </div>

                                        {/* Custom Tag */}
                                        {customTag && (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 16px',
                                                background: `${theme.accentColor}30`,
                                                border: `2px solid ${theme.accentColor}`,
                                                borderRadius: '16px',
                                                fontSize: selectedFormat === 'instagram_story' ? '15px' : '12px',
                                                fontWeight: 'bold',
                                                color: theme.textColor
                                            }}>
                                                {customTag}
                                            </div>
                                        )}

                                        {/* URL */}
                                        {customUrl && (
                                            <div style={{
                                                fontSize: selectedFormat === 'instagram_story' ? '15px' : '12px',
                                                color: theme.accentColor,
                                                fontWeight: 'bold',
                                                opacity: 0.9,
                                                textAlign: 'center'
                                            }}>
                                                {customUrl}
                                            </div>
                                        )}
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
