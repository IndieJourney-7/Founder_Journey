import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Lightbulb, CheckCircle, XCircle, Share2, Copy, Flame, Trophy, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useMountain } from '../../context/MountainContext';
import SignupPromptModal from '../SignupPromptModal';

// Export format configurations for social media
const EXPORT_FORMATS = {
    twitter: {
        name: 'X (Twitter)',
        width: 1200,
        height: 675,
        icon: '𝕏'
    },
    linkedin: {
        name: 'LinkedIn',
        width: 1200,
        height: 627,
        icon: 'in'
    },
    instagram_square: {
        name: 'Instagram',
        width: 1080,
        height: 1080,
        icon: '□'
    },
    instagram_story: {
        name: 'Story',
        width: 1080,
        height: 1920,
        icon: '📱'
    }
};

// VIRAL LAYOUTS - Designed for engagement
const LAYOUTS = {
    building_public: {
        name: 'Building in Public',
        icon: '🚀',
        description: 'Day counter + lesson - Perfect for #buildinpublic'
    },
    thread_starter: {
        name: 'Thread Starter',
        icon: '🧵',
        description: 'Hook format for viral threads'
    },
    humble_brag: {
        name: 'LinkedIn Pro',
        icon: '💼',
        description: 'Professional insight card'
    },
    wisdom_drop: {
        name: 'Wisdom Drop',
        icon: '💡',
        description: 'Clean quote-focused design'
    },
    stats_flex: {
        name: 'Stats Flex',
        icon: '📊',
        description: 'Show your journey numbers'
    }
};

// Premium gradient themes
const THEMES = {
    midnight_gold: {
        name: 'Midnight Gold',
        bg: ['#0F1F3D', '#1a1a2e'],
        accent: '#E7C778',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.6)',
        glow: 'rgba(231,199,120,0.4)'
    },
    ocean_teal: {
        name: 'Ocean Teal',
        bg: ['#0d3b4c', '#0a2533'],
        accent: '#1CC5A3',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.6)',
        glow: 'rgba(28,197,163,0.4)'
    },
    success_green: {
        name: 'Success',
        bg: ['#065F46', '#022c22'],
        accent: '#34D399',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        glow: 'rgba(52,211,153,0.4)'
    },
    learning_amber: {
        name: 'Learning',
        bg: ['#92400E', '#451a03'],
        accent: '#FCD34D',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        glow: 'rgba(252,211,77,0.4)'
    },
    royal_purple: {
        name: 'Royal Purple',
        bg: ['#5B21B6', '#2e1065'],
        accent: '#C4B5FD',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        glow: 'rgba(196,181,253,0.4)'
    },
    noir: {
        name: 'Noir',
        bg: ['#18181b', '#09090b'],
        accent: '#fafafa',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.5)',
        glow: 'rgba(255,255,255,0.2)'
    }
};

// Font options
const FONTS = {
    modern: '"Inter", "SF Pro Display", system-ui, sans-serif',
    editorial: '"Crimson Pro", "Georgia", serif',
    bold: '"Archivo Black", "Impact", sans-serif',
    mono: '"IBM Plex Mono", monospace'
};

export default function LessonCardExport({ isOpen, onClose, lesson, stepTitle }) {
    if (!lesson) return null;

    const { isDemoMode, currentMountain, journeyNotes, steps, progress, successfulSteps, resolvedSteps } = useMountain();
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const isSuccess = lesson.result === 'success';

    // Calculate journey stats
    const totalLessons = journeyNotes.length;
    const successCount = journeyNotes.filter(n => n.result === 'success').length;
    const learningCount = journeyNotes.filter(n => n.result === 'failed' || n.result === 'failure').length;

    // Calculate day count from mountain creation or first lesson
    const startDate = currentMountain?.created_at ? new Date(currentMountain.created_at) : new Date();
    const today = new Date();
    const dayCount = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));

    // User inputs
    const [title, setTitle] = useState(lesson.title || '');
    const [lessonText, setLessonText] = useState(lesson.lesson_learned || '');
    const [context, setContext] = useState(lesson.reflection_text || '');
    const [hookText, setHookText] = useState(`Day ${dayCount} of building ${currentMountain?.title || 'my startup'}:`);
    const [authorName, setAuthorName] = useState('');
    const [authorHandle, setAuthorHandle] = useState('');
    const [engagementHook, setEngagementHook] = useState('Agree? Drop a 🔥 below');
    const [customUrl, setCustomUrl] = useState('shift-journey.vercel.app');
    const [showStats, setShowStats] = useState(true);
    const [showEngagementHook, setShowEngagementHook] = useState(true);

    // Export settings
    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState(isSuccess ? 'success_green' : 'learning_amber');
    const [selectedLayout, setSelectedLayout] = useState('building_public');
    const [selectedFont, setSelectedFont] = useState('modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const exportRef = useRef(null);

    const format = EXPORT_FORMATS[selectedFormat];
    const theme = THEMES[selectedTheme];
    const layout = LAYOUTS[selectedLayout];

    // Generate preview when settings change
    useEffect(() => {
        if (isOpen && exportRef.current) {
            const timer = setTimeout(generatePreview, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedFormat, selectedTheme, selectedLayout, selectedFont, title, lessonText, context, hookText, authorName, authorHandle, engagementHook, customUrl, showStats, showEngagementHook]);

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

        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }
        const link = document.createElement('a');
        link.download = `lesson-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    const handleCopyImage = async () => {
        if (!previewUrl) return;

        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }

        try {
            const blob = await (await fetch(previewUrl)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            alert('✅ Image copied! Paste directly into X or LinkedIn.');
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('❌ Failed to copy. Please download instead.');
        }
    };

    const handleShareToX = () => {
        if (!previewUrl) return;
        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }

        handleDownload();
        const tweetText = `${hookText}\n\n"${lessonText}"\n\n${showEngagementHook ? engagementHook + '\n\n' : ''}#buildinpublic`;
        setTimeout(() => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
        }, 500);
    };

    const handleShareToLinkedIn = () => {
        if (!previewUrl) return;
        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }

        handleDownload();
        setTimeout(() => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(customUrl || 'https://shift-journey.vercel.app')}`, '_blank');
        }, 500);
    };

    // ============ LAYOUT RENDERERS ============

    const renderBuildingPublicLayout = () => {
        const isVertical = format.height > format.width;
        const scaleFactor = isVertical ? 1.3 : 1;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(145deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                position: 'relative',
                fontFamily: FONTS[selectedFont],
                overflow: 'hidden',
                padding: isVertical ? '80px 50px' : '50px 60px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Glow Effects */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: '50%',
                    height: '50%',
                    background: `radial-gradient(circle, ${theme.glow}, transparent)`,
                    filter: 'blur(100px)',
                    pointerEvents: 'none'
                }} />

                {/* Top Badge - Day Counter */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: isVertical ? '40px' : '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 24px',
                        background: `${theme.accent}20`,
                        border: `2px solid ${theme.accent}`,
                        borderRadius: '50px',
                        boxShadow: `0 0 30px ${theme.glow}`
                    }}>
                        <Flame size={24 * scaleFactor} color={theme.accent} />
                        <span style={{
                            fontSize: `${22 * scaleFactor}px`,
                            fontWeight: 800,
                            color: theme.accent,
                            letterSpacing: '-0.5px'
                        }}>
                            DAY {dayCount}
                        </span>
                    </div>

                    {isSuccess ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'rgba(52,211,153,0.15)',
                            border: '2px solid rgba(52,211,153,0.5)',
                            borderRadius: '50px'
                        }}>
                            <CheckCircle size={20 * scaleFactor} color="#34D399" />
                            <span style={{ fontSize: `${16 * scaleFactor}px`, fontWeight: 700, color: '#34D399' }}>WIN</span>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'rgba(252,211,77,0.15)',
                            border: '2px solid rgba(252,211,77,0.5)',
                            borderRadius: '50px'
                        }}>
                            <Lightbulb size={20 * scaleFactor} color="#FCD34D" />
                            <span style={{ fontSize: `${16 * scaleFactor}px`, fontWeight: 700, color: '#FCD34D' }}>LESSON</span>
                        </div>
                    )}
                </div>

                {/* Hook Text */}
                <p style={{
                    fontSize: `${20 * scaleFactor}px`,
                    color: theme.muted,
                    marginBottom: '16px',
                    fontWeight: 500
                }}>
                    {hookText}
                </p>

                {/* Main Title */}
                {title && (
                    <h1 style={{
                        fontSize: `${isVertical ? 52 : 44}px`,
                        fontWeight: 800,
                        color: theme.text,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        maxWidth: '90%'
                    }}>
                        {title}
                    </h1>
                )}

                {/* Lesson Quote */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <blockquote style={{
                        fontSize: `${isVertical ? 32 : 26}px`,
                        fontStyle: 'italic',
                        color: theme.text,
                        lineHeight: 1.5,
                        paddingLeft: '24px',
                        borderLeft: `4px solid ${theme.accent}`,
                        maxWidth: '95%',
                        opacity: 0.95
                    }}>
                        "{lessonText}"
                    </blockquote>
                </div>

                {/* Stats Bar */}
                {showStats && (
                    <div style={{
                        display: 'flex',
                        gap: '24px',
                        marginTop: '32px',
                        padding: '20px 28px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: `${28 * scaleFactor}px`, fontWeight: 800, color: theme.accent }}>{totalLessons}</div>
                            <div style={{ fontSize: `${12 * scaleFactor}px`, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Lessons</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: `${28 * scaleFactor}px`, fontWeight: 800, color: '#34D399' }}>{successCount}</div>
                            <div style={{ fontSize: `${12 * scaleFactor}px`, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Wins</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: `${28 * scaleFactor}px`, fontWeight: 800, color: '#FCD34D' }}>{learningCount}</div>
                            <div style={{ fontSize: `${12 * scaleFactor}px`, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Learnings</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: `${28 * scaleFactor}px`, fontWeight: 800, color: theme.text }}>{Math.round(progress)}%</div>
                            <div style={{ fontSize: `${12 * scaleFactor}px`, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Progress</div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '24px'
                }}>
                    {showEngagementHook && engagementHook && (
                        <div style={{
                            fontSize: `${16 * scaleFactor}px`,
                            color: theme.accent,
                            fontWeight: 600
                        }}>
                            {engagementHook}
                        </div>
                    )}
                    <div style={{
                        fontSize: `${14 * scaleFactor}px`,
                        color: theme.muted,
                        fontFamily: FONTS.mono
                    }}>
                        {customUrl}
                    </div>
                </div>
            </div>
        );
    };

    const renderThreadStarterLayout = () => {
        const isVertical = format.height > format.width;
        const scaleFactor = isVertical ? 1.4 : 1;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(180deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                position: 'relative',
                fontFamily: FONTS.bold,
                overflow: 'hidden',
                padding: isVertical ? '100px 60px' : '60px 80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                {/* Big Impact Number */}
                <div style={{
                    fontSize: `${isVertical ? 180 : 140}px`,
                    fontWeight: 900,
                    color: theme.accent,
                    lineHeight: 0.9,
                    opacity: 0.15,
                    position: 'absolute',
                    top: isVertical ? '80px' : '20px',
                    right: '40px'
                }}>
                    {dayCount}
                </div>

                {/* Thread Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 900,
                        color: theme.bg[0]
                    }}>
                        1
                    </div>
                    <span style={{
                        fontSize: `${18 * scaleFactor}px`,
                        color: theme.muted,
                        fontFamily: FONTS.modern,
                        fontWeight: 500
                    }}>
                        / Thread
                    </span>
                </div>

                {/* Hook */}
                <h1 style={{
                    fontSize: `${isVertical ? 56 : 48}px`,
                    fontWeight: 900,
                    color: theme.text,
                    lineHeight: 1.1,
                    marginBottom: '40px',
                    maxWidth: '90%',
                    textTransform: 'uppercase',
                    letterSpacing: '-2px'
                }}>
                    {title || `What I learned on Day ${dayCount}`}
                </h1>

                {/* Teaser */}
                <p style={{
                    fontSize: `${isVertical ? 28 : 24}px`,
                    color: theme.muted,
                    fontFamily: FONTS.modern,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    maxWidth: '80%',
                    marginBottom: '48px'
                }}>
                    {lessonText.slice(0, 100)}...
                </p>

                {/* CTA Arrow */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 40px',
                    background: theme.accent,
                    borderRadius: '60px',
                    color: theme.bg[0],
                    fontSize: `${20 * scaleFactor}px`,
                    fontWeight: 800
                }}>
                    READ THE THREAD ↓
                </div>

                {/* Footer */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: `${14 * scaleFactor}px`,
                    color: theme.muted,
                    fontFamily: FONTS.mono
                }}>
                    {customUrl}
                </div>
            </div>
        );
    };

    const renderHumbleBragLayout = () => {
        const isVertical = format.height > format.width;
        const scaleFactor = isVertical ? 1.3 : 1;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                position: 'relative',
                fontFamily: FONTS.modern,
                overflow: 'hidden',
                padding: isVertical ? '80px 50px' : '50px 70px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Professional Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '40px',
                    paddingBottom: '24px',
                    borderBottom: `1px solid rgba(255,255,255,0.1)`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Author Avatar Placeholder */}
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.glow})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 700,
                            color: theme.bg[0]
                        }}>
                            {(authorName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: theme.text }}>
                                {authorName || 'Building in Public'}
                            </div>
                            <div style={{ fontSize: '14px', color: theme.muted }}>
                                {authorHandle ? `@${authorHandle}` : `Day ${dayCount} • ${currentMountain?.title || 'Founder Journey'}`}
                            </div>
                        </div>
                    </div>

                    {/* LinkedIn Style Badge */}
                    <div style={{
                        padding: '8px 16px',
                        background: 'rgba(10,102,194,0.2)',
                        border: '1px solid rgba(10,102,194,0.5)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0A66C2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {isSuccess ? '✓ Milestone' : '💡 Insight'}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {title && (
                        <h1 style={{
                            fontSize: `${isVertical ? 48 : 40}px`,
                            fontWeight: 700,
                            color: theme.text,
                            lineHeight: 1.2,
                            marginBottom: '28px'
                        }}>
                            {title}
                        </h1>
                    )}

                    <p style={{
                        fontSize: `${isVertical ? 26 : 22}px`,
                        color: theme.text,
                        lineHeight: 1.6,
                        opacity: 0.9,
                        marginBottom: '32px'
                    }}>
                        {lessonText}
                    </p>

                    {context && (
                        <p style={{
                            fontSize: `${16 * scaleFactor}px`,
                            color: theme.muted,
                            lineHeight: 1.5,
                            paddingLeft: '20px',
                            borderLeft: `3px solid ${theme.accent}`,
                            fontStyle: 'italic'
                        }}>
                            {context}
                        </p>
                    )}
                </div>

                {/* Professional Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '24px',
                    borderTop: `1px solid rgba(255,255,255,0.1)`
                }}>
                    {showStats && (
                        <div style={{ display: 'flex', gap: '32px' }}>
                            <div>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: theme.accent }}>{totalLessons}</span>
                                <span style={{ fontSize: '14px', color: theme.muted, marginLeft: '8px' }}>lessons documented</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: theme.accent }}>{dayCount}</span>
                                <span style={{ fontSize: '14px', color: theme.muted, marginLeft: '8px' }}>days building</span>
                            </div>
                        </div>
                    )}
                    <div style={{ fontSize: '14px', color: theme.muted, fontFamily: FONTS.mono }}>
                        {customUrl}
                    </div>
                </div>
            </div>
        );
    };

    const renderWisdomDropLayout = () => {
        const isVertical = format.height > format.width;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(145deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                position: 'relative',
                fontFamily: FONTS.editorial,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isVertical ? '100px 60px' : '60px 80px',
                textAlign: 'center'
            }}>
                {/* Large Quote Mark */}
                <div style={{
                    fontSize: '200px',
                    color: theme.accent,
                    opacity: 0.1,
                    position: 'absolute',
                    top: isVertical ? '60px' : '0',
                    left: '40px',
                    lineHeight: 1,
                    fontFamily: 'Georgia, serif'
                }}>
                    "
                </div>

                {/* Icon */}
                <div style={{
                    marginBottom: '32px',
                    color: theme.accent,
                    opacity: 0.9
                }}>
                    {isSuccess ? <Trophy size={56} /> : <Lightbulb size={56} />}
                </div>

                {/* Title */}
                {title && (
                    <h2 style={{
                        fontSize: `${isVertical ? 44 : 36}px`,
                        fontWeight: 700,
                        color: theme.text,
                        marginBottom: '32px',
                        lineHeight: 1.2,
                        maxWidth: '85%'
                    }}>
                        {title}
                    </h2>
                )}

                {/* Main Quote */}
                <blockquote style={{
                    fontSize: `${isVertical ? 32 : 28}px`,
                    fontStyle: 'italic',
                    color: theme.text,
                    lineHeight: 1.5,
                    maxWidth: '80%',
                    marginBottom: '48px',
                    opacity: 0.95
                }}>
                    "{lessonText}"
                </blockquote>

                {/* Attribution */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        padding: '8px 20px',
                        background: `${theme.accent}20`,
                        border: `2px solid ${theme.accent}`,
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.accent
                    }}>
                        Day {dayCount} • Lesson #{journeyNotes.indexOf(lesson) + 1}
                    </div>

                    <div style={{ fontSize: '14px', color: theme.muted, fontFamily: FONTS.mono }}>
                        {customUrl}
                    </div>
                </div>
            </div>
        );
    };

    const renderStatsFlexLayout = () => {
        const isVertical = format.height > format.width;
        const scaleFactor = isVertical ? 1.3 : 1;
        const winRate = totalLessons > 0 ? Math.round((successCount / totalLessons) * 100) : 0;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                position: 'relative',
                fontFamily: FONTS.modern,
                overflow: 'hidden',
                padding: isVertical ? '80px 50px' : '50px 60px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <TrendingUp size={32} color={theme.accent} />
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: theme.text,
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        Journey Stats
                    </span>
                </div>

                {/* Big Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isVertical ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        border: `1px solid ${theme.accent}30`
                    }}>
                        <div style={{ fontSize: `${48 * scaleFactor}px`, fontWeight: 800, color: theme.accent }}>{dayCount}</div>
                        <div style={{ fontSize: '14px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Days Active</div>
                    </div>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: `${48 * scaleFactor}px`, fontWeight: 800, color: theme.text }}>{totalLessons}</div>
                        <div style={{ fontSize: '14px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Lessons</div>
                    </div>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(52,211,153,0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(52,211,153,0.3)'
                    }}>
                        <div style={{ fontSize: `${48 * scaleFactor}px`, fontWeight: 800, color: '#34D399' }}>{successCount}</div>
                        <div style={{ fontSize: '14px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Wins</div>
                    </div>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(252,211,77,0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(252,211,77,0.3)'
                    }}>
                        <div style={{ fontSize: `${48 * scaleFactor}px`, fontWeight: 800, color: '#FCD34D' }}>{winRate}%</div>
                        <div style={{ fontSize: '14px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Win Rate</div>
                    </div>
                </div>

                {/* Latest Lesson */}
                <div style={{
                    flex: 1,
                    padding: '28px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: theme.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '16px'
                    }}>
                        Latest {isSuccess ? 'Win' : 'Learning'}
                    </div>

                    {title && (
                        <h2 style={{
                            fontSize: `${isVertical ? 32 : 28}px`,
                            fontWeight: 700,
                            color: theme.text,
                            marginBottom: '16px',
                            lineHeight: 1.2
                        }}>
                            {title}
                        </h2>
                    )}

                    <p style={{
                        fontSize: `${isVertical ? 22 : 18}px`,
                        color: theme.muted,
                        lineHeight: 1.5,
                        fontStyle: 'italic'
                    }}>
                        "{lessonText}"
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '24px'
                }}>
                    <div style={{
                        fontSize: '16px',
                        color: theme.accent,
                        fontWeight: 600
                    }}>
                        {currentMountain?.title || 'My Journey'}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.muted, fontFamily: FONTS.mono }}>
                        {customUrl}
                    </div>
                </div>
            </div>
        );
    };

    const renderSelectedLayout = () => {
        switch (selectedLayout) {
            case 'building_public': return renderBuildingPublicLayout();
            case 'thread_starter': return renderThreadStarterLayout();
            case 'humble_brag': return renderHumbleBragLayout();
            case 'wisdom_drop': return renderWisdomDropLayout();
            case 'stats_flex': return renderStatsFlexLayout();
            default: return renderBuildingPublicLayout();
        }
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
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <Sparkles className="text-brand-gold" size={28} />
                                Create Viral Lesson Card
                            </h2>
                            <p className="text-white/60">Design share-worthy content for X, LinkedIn & Instagram</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left: Controls */}
                            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">

                                {/* Layout Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Layout Style</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(LAYOUTS).map(([key, lay]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedLayout(key)}
                                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                                                    selectedLayout === key
                                                        ? 'border-brand-teal bg-brand-teal/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                                title={lay.description}
                                            >
                                                <div className="text-2xl mb-1">{lay.icon}</div>
                                                <div className="text-[10px] text-white font-medium truncate w-full text-center">{lay.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Platform</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(EXPORT_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedFormat === key
                                                        ? 'border-brand-teal bg-brand-teal/10 text-white'
                                                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-xl mb-1">{fmt.icon}</div>
                                                <div className="text-xs font-bold">{fmt.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-3">Theme</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedTheme === key ? 'border-brand-teal' : 'border-white/10 hover:border-white/20'
                                                }`}
                                                style={{
                                                    background: `linear-gradient(135deg, ${thm.bg[0]}, ${thm.bg[1]})`
                                                }}
                                            >
                                                <div className="text-xs font-bold text-white">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Inputs */}
                                <div className="space-y-4 pt-2 border-t border-white/10">
                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Hook Text</label>
                                        <input
                                            type="text"
                                            value={hookText}
                                            onChange={(e) => setHookText(e.target.value)}
                                            placeholder="Day X of building..."
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Your lesson title"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Main Lesson</label>
                                        <textarea
                                            value={lessonText}
                                            onChange={(e) => setLessonText(e.target.value)}
                                            placeholder="The key insight..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold text-white mb-2">Author Name</label>
                                            <input
                                                type="text"
                                                value={authorName}
                                                onChange={(e) => setAuthorName(e.target.value)}
                                                placeholder="Your name"
                                                className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-white mb-2">@Handle</label>
                                            <input
                                                type="text"
                                                value={authorHandle}
                                                onChange={(e) => setAuthorHandle(e.target.value)}
                                                placeholder="yourhandle"
                                                className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Engagement Hook</label>
                                        <input
                                            type="text"
                                            value={engagementHook}
                                            onChange={(e) => setEngagementHook(e.target.value)}
                                            placeholder="Agree? Drop a 🔥"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Website URL</label>
                                        <input
                                            type="text"
                                            value={customUrl}
                                            onChange={(e) => setCustomUrl(e.target.value)}
                                            placeholder="your-site.com"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    {/* Toggle Options */}
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showStats}
                                                onChange={(e) => setShowStats(e.target.checked)}
                                                className="rounded"
                                            />
                                            Show journey stats
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showEngagementHook}
                                                onChange={(e) => setShowEngagementHook(e.target.checked)}
                                                className="rounded"
                                            />
                                            Show engagement hook
                                        </label>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={handleDownload}
                                        disabled={!previewUrl || isGenerating}
                                        className="w-full py-3 bg-brand-teal text-brand-blue font-bold rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} />
                                        {isGenerating ? 'Generating...' : 'Download Image'}
                                    </button>

                                    <button
                                        onClick={handleCopyImage}
                                        disabled={!previewUrl || isGenerating}
                                        className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Copy size={18} />
                                        Copy to Clipboard
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleShareToX}
                                            disabled={!previewUrl || isGenerating}
                                            className="py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                            </svg>
                                            Share to X
                                        </button>
                                        <button
                                            onClick={handleShareToLinkedIn}
                                            disabled={!previewUrl || isGenerating}
                                            className="py-2.5 bg-[#0A66C2] text-white font-bold rounded-xl hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                            </svg>
                                            LinkedIn
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Preview</label>
                                <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full rounded-lg shadow-2xl" />
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center text-white/30">
                                            Generating preview...
                                        </div>
                                    )}
                                </div>

                                {/* Pro Tips */}
                                <div className="mt-4 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20">
                                    <p className="text-brand-gold text-sm font-medium mb-2">Pro Tips for Viral Posts</p>
                                    <ul className="text-white/60 text-xs space-y-1">
                                        <li>• Use "Day X" format - it creates FOMO</li>
                                        <li>• Add an engagement hook to boost comments</li>
                                        <li>• Post at 8am, 12pm, or 6pm for best reach</li>
                                        <li>• Include #buildinpublic for discovery</li>
                                    </ul>
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
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {renderSelectedLayout()}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <SignupPromptModal
                isOpen={showSignupPrompt}
                onClose={() => setShowSignupPrompt(false)}
                promptType="share"
            />
        </AnimatePresence>
    );
}
