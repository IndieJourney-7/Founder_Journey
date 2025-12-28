import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Sparkles, Layout, Image, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useMountain } from '../../context/MountainContext';
import SignupPromptModal from '../SignupPromptModal';
import ProductGallery from '../ProductGallery';

// ============ EXPORT FORMATS ============
const EXPORT_FORMATS = {
    twitter: {
        name: 'X (Twitter)',
        width: 1500,
        height: 500,
        icon: '𝕏'
    },
    linkedin: {
        name: 'LinkedIn',
        width: 1584,
        height: 396,
        icon: 'in'
    },
    instagram_square: {
        name: 'Square Post',
        width: 1080,
        height: 1080,
        icon: '□'
    },
    instagram_story: {
        name: 'Story/Reel',
        width: 1080,
        height: 1920,
        icon: '▯'
    }
};

// ============ STUNNING THEMES ============
const THEMES = {
    midnight: {
        name: 'Midnight',
        bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        accent: '#a78bfa',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.6)',
        glow: 'rgba(167, 139, 250, 0.4)'
    },
    sunset: {
        name: 'Sunset',
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.8)',
        glow: 'rgba(255, 255, 255, 0.3)'
    },
    forest: {
        name: 'Forest',
        bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
        accent: '#fef3c7',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        glow: 'rgba(254, 243, 199, 0.3)'
    },
    noir: {
        name: 'Noir',
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        accent: '#e7c778',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.5)',
        glow: 'rgba(231, 199, 120, 0.4)'
    },
    ocean: {
        name: 'Ocean',
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.8)',
        glow: 'rgba(255, 255, 255, 0.3)'
    },
    fire: {
        name: 'Fire',
        bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.8)',
        glow: 'rgba(255, 255, 255, 0.4)'
    },
    minimal: {
        name: 'Minimal',
        bg: 'linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)',
        accent: '#18181b',
        text: '#18181b',
        muted: 'rgba(0,0,0,0.5)',
        glow: 'rgba(0, 0, 0, 0.1)'
    }
};

// ============ LAYOUT TEMPLATES ============
const LAYOUTS = {
    product_hero: {
        name: 'Product Hero',
        description: 'Product image prominently featured with stats',
        icon: '🚀'
    },
    split_screen: {
        name: 'Split Screen',
        description: 'Product on left, journey on right',
        icon: '⬜'
    },
    journey_focus: {
        name: 'Journey Focus',
        description: 'Classic mountain journey with optional product',
        icon: '🏔️'
    },
    stats_card: {
        name: 'Stats Card',
        description: 'Bold numbers with product showcase',
        icon: '📊'
    },
    minimal_clean: {
        name: 'Minimal Clean',
        description: 'Clean typography, subtle elegance',
        icon: '✨'
    }
};

// Font options
const FONTS = {
    modern: '"Inter", "SF Pro Display", system-ui, sans-serif',
    editorial: '"Crimson Pro", "Playfair Display", Georgia, serif',
    technical: '"IBM Plex Mono", "Fira Code", monospace',
    bold: '"Archivo Black", "Impact", sans-serif'
};

// Professional S-curve mountain path
const MOUNTAIN_PATH = "M150 850 C 300 800, 400 700, 550 600 C 700 500, 850 400, 1000 300 C 1100 250, 1150 220, 1250 180";

// Calculate point on path at given progress
const getPointOnPath = (pathString, progress) => {
    try {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathString);
        svg.appendChild(path);
        document.body.appendChild(svg);

        const pathLength = path.getTotalLength();
        const point = path.getPointAtLength((progress / 100) * pathLength);

        document.body.removeChild(svg);
        return point;
    } catch (e) {
        return { x: 150, y: 850 };
    }
};

export default function ProductShowcaseBanner({ isOpen, onClose }) {
    const {
        currentMountain,
        progress,
        resolvedSteps,
        totalPlanned,
        productImages,
        isDemoMode
    } = useMountain();

    const [showSignupPrompt, setShowSignupPrompt] = useState(false);

    // User inputs
    const [headline, setHeadline] = useState(currentMountain?.title || 'Building Something Amazing');
    const [subheadline, setSubheadline] = useState('');
    const [goalTarget, setGoalTarget] = useState(currentMountain?.target || '$1K MRR');
    const [metric, setMetric] = useState({ label: 'Revenue', value: '$0', show: true });
    const [dayCount, setDayCount] = useState('1');
    const [quote, setQuote] = useState('The journey of a thousand miles begins with a single step');
    const [cta, setCta] = useState({ text: '', url: 'shift-journey.vercel.app', show: true });
    const [selectedProductImage, setSelectedProductImage] = useState(null);
    const [showMountainPath, setShowMountainPath] = useState(true);

    // Export settings
    const [selectedFormat, setSelectedFormat] = useState('twitter');
    const [selectedTheme, setSelectedTheme] = useState('midnight');
    const [selectedLayout, setSelectedLayout] = useState('product_hero');
    const [selectedFont, setSelectedFont] = useState('modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const exportRef = useRef(null);
    const format = EXPORT_FORMATS[selectedFormat];
    const theme = THEMES[selectedTheme];
    const layout = LAYOUTS[selectedLayout];

    // Auto-select first product image
    useEffect(() => {
        if (productImages.length > 0 && !selectedProductImage) {
            setSelectedProductImage(productImages[0]);
        }
    }, [productImages]);

    // Calculate safe progress
    const safeProgress = Math.round(progress || 0);

    // Calculate climber position on path
    const climberPoint = safeProgress > 0 ? getPointOnPath(MOUNTAIN_PATH, Math.min(safeProgress, 95)) : { x: 150, y: 850 };
    const peakPoint = { x: 1250, y: 180 };

    // Generate preview
    useEffect(() => {
        if (isOpen && exportRef.current) {
            const timer = setTimeout(generatePreview, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedFormat, selectedTheme, selectedLayout, selectedFont, headline, subheadline, metric, dayCount, quote, cta, selectedProductImage, goalTarget, showMountainPath]);

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
        link.download = `shift-banner-${selectedLayout}-${Date.now()}.png`;
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
            alert('Image copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy. Please download instead.');
        }
    };

    // Generate viral tweet text for banners
    const generateBannerTweetText = () => {
        const hashtags = '#buildinpublic #startups #indiehackers';
        const trackingUrl = `\n\n🏔️ ${cta.url || 'shift-journey.vercel.app'}`;

        if (selectedLayout === 'product_hero') {
            return `🚀 ${headline}\n\n📊 Day ${dayCount} Progress:\n• ${safeProgress}% to ${goalTarget}\n• ${successfulSteps} milestones hit\n\n${quote ? `"${quote.slice(0, 100)}${quote.length > 100 ? '...' : ''}"` : ''}\n\n${hashtags}${trackingUrl}`;
        } else if (selectedLayout === 'journey_focus') {
            return `🏔️ Day ${dayCount} of building ${headline}\n\n📈 ${safeProgress}% of the way to ${goalTarget}\n\n${successfulSteps} wins | ${steps.length} total steps\n\nThe climb continues...\n\n${hashtags}${trackingUrl}`;
        } else if (selectedLayout === 'stats_card') {
            return `📊 Weekly Stats Update:\n\n🎯 Goal: ${goalTarget}\n📈 Progress: ${safeProgress}%\n✅ Wins: ${successfulSteps}\n📅 Day: ${dayCount}\n\n${quote ? `"${quote.slice(0, 80)}..."` : ''}\n\n${hashtags}${trackingUrl}`;
        } else if (selectedLayout === 'minimal_clean') {
            return `${headline}\n\n${subheadline ? `${subheadline}\n\n` : ''}Day ${dayCount} • ${safeProgress}% progress\n\n${hashtags}${trackingUrl}`;
        } else {
            // split_screen
            return `🚀 ${headline}\n\n${quote ? `"${quote.slice(0, 120)}${quote.length > 120 ? '...' : ''}"` : ''}\n\n📊 ${safeProgress}% to ${goalTarget}\n\n${hashtags}${trackingUrl}`;
        }
    };

    const [bannerTweetText, setBannerTweetText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Update tweet text when inputs change
    useEffect(() => {
        setBannerTweetText(generateBannerTweetText());
    }, [selectedLayout, headline, subheadline, quote, dayCount, safeProgress, goalTarget, successfulSteps, cta.url]);

    const handleCopyTweet = async () => {
        try {
            await navigator.clipboard.writeText(bannerTweetText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy tweet:', error);
        }
    };

    const handleShareToX = async () => {
        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }

        // Download image + copy tweet text
        handleDownload();
        await navigator.clipboard.writeText(bannerTweetText);

        // Show instructions
        alert('✅ Image downloaded + Tweet copied!\n\n1. Open X/Twitter\n2. Click "Post"\n3. Paste the text (Ctrl+V)\n4. Attach the downloaded image\n5. Post! 🚀');
    };

    const handleShareToLinkedIn = async () => {
        if (isDemoMode) {
            setShowSignupPrompt(true);
            return;
        }

        // Generate LinkedIn-specific text
        const linkedInText = `${headline}\n\n${quote ? `${quote}\n\n` : ''}📊 Progress Update:\n• Day ${dayCount} of the journey\n• ${safeProgress}% towards ${goalTarget}\n• ${successfulSteps} milestones achieved\n\n#BuildInPublic #Startups #FounderLife #Entrepreneurship`;

        // Copy text and download image
        await navigator.clipboard.writeText(linkedInText);
        handleDownload();

        alert('✅ Image downloaded + Post text copied!\n\n1. Open LinkedIn\n2. Start a new post\n3. Paste the text (Ctrl+V)\n4. Attach the downloaded image\n5. Post! 🚀');
    };

    // ============ LAYOUT RENDERERS ============

    const renderProductHeroLayout = () => {
        const isVertical = format.height > format.width;
        const hasProduct = selectedProductImage;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isVertical ? '60px 40px' : '40px 60px',
                fontFamily: FONTS[selectedFont]
            }}>
                {/* Product Image Section */}
                {hasProduct && (
                    <div style={{
                        flex: isVertical ? 'none' : '0 0 35%',
                        height: isVertical ? '40%' : '80%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            maxWidth: isVertical ? '300px' : '100%',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: `0 25px 50px -12px ${theme.glow}, 0 0 0 1px rgba(255,255,255,0.1)`,
                            background: 'rgba(255,255,255,0.05)'
                        }}>
                            <img
                                src={selectedProductImage.data}
                                alt="Product"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: hasProduct && !isVertical ? 'flex-start' : 'center',
                    textAlign: hasProduct && !isVertical ? 'left' : 'center',
                    padding: isVertical ? '30px 0' : '0 40px',
                    gap: isVertical ? '20px' : '16px'
                }}>
                    {/* Headline */}
                    <h1 style={{
                        fontSize: isVertical ? '48px' : `${Math.min(format.width * 0.04, 56)}px`,
                        fontWeight: 800,
                        color: theme.text,
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: `0 4px 20px ${theme.glow}`
                    }}>
                        {headline}
                    </h1>

                    {/* Stats Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        marginTop: '8px'
                    }}>
                        {/* Day Count */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '6px'
                        }}>
                            <span style={{
                                fontSize: isVertical ? '36px' : '32px',
                                fontWeight: 900,
                                color: theme.accent
                            }}>
                                Day {dayCount}
                            </span>
                        </div>

                        {/* Divider */}
                        <div style={{
                            width: '2px',
                            height: '30px',
                            background: theme.muted,
                            borderRadius: '2px'
                        }} />

                        {/* Progress */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontSize: isVertical ? '28px' : '24px',
                                fontWeight: 700,
                                color: theme.text
                            }}>
                                {safeProgress}%
                            </span>
                            <span style={{
                                fontSize: '14px',
                                color: theme.muted
                            }}>
                                complete
                            </span>
                        </div>

                        {/* Metric */}
                        {metric.show && (
                            <>
                                <div style={{
                                    width: '2px',
                                    height: '30px',
                                    background: theme.muted,
                                    borderRadius: '2px'
                                }} />
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '6px'
                                }}>
                                    <span style={{
                                        fontSize: isVertical ? '28px' : '24px',
                                        fontWeight: 700,
                                        color: theme.accent
                                    }}>
                                        {metric.value}
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: theme.muted
                                    }}>
                                        {metric.label}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quote */}
                    {quote && (
                        <p style={{
                            fontSize: isVertical ? '20px' : '18px',
                            color: theme.muted,
                            fontStyle: 'italic',
                            margin: '16px 0 0 0',
                            maxWidth: '500px',
                            lineHeight: 1.5
                        }}>
                            "{quote}"
                        </p>
                    )}

                    {/* Progress Bar */}
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        marginTop: '16px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${safeProgress}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}cc)`,
                            borderRadius: '4px',
                            boxShadow: `0 0 20px ${theme.glow}`
                        }} />
                    </div>
                </div>

                {/* URL Badge */}
                {cta.show && cta.url && (
                    <div style={{
                        position: 'absolute',
                        bottom: isVertical ? '30px' : '20px',
                        right: isVertical ? '50%' : '40px',
                        transform: isVertical ? 'translateX(50%)' : 'none',
                        padding: '8px 16px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <span style={{
                            fontSize: '14px',
                            color: theme.muted,
                            fontFamily: FONTS.technical
                        }}>
                            {cta.url}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const renderSplitScreenLayout = () => {
        const hasProduct = selectedProductImage;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                fontFamily: FONTS[selectedFont]
            }}>
                {/* Left: Product */}
                <div style={{
                    flex: '0 0 45%',
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    {hasProduct ? (
                        <div style={{
                            width: '100%',
                            height: '80%',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: `0 30px 60px -15px ${theme.glow}`
                        }}>
                            <img
                                src={selectedProductImage.data}
                                alt="Product"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '20px',
                            border: `2px dashed ${theme.muted}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.muted
                        }}>
                            Add Product Image
                        </div>
                    )}
                </div>

                {/* Right: Journey */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '40px 50px',
                    gap: '20px'
                }}>
                    {/* Day Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: theme.accent,
                        borderRadius: '20px',
                        alignSelf: 'flex-start'
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: theme.bg.includes('#fafafa') ? '#000' : '#000'
                        }}>
                            DAY {dayCount}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: `${Math.min(format.width * 0.032, 42)}px`,
                        fontWeight: 800,
                        color: theme.text,
                        margin: 0,
                        lineHeight: 1.2
                    }}>
                        {headline}
                    </h1>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        gap: '30px'
                    }}>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: theme.accent }}>
                                {safeProgress}%
                            </div>
                            <div style={{ fontSize: '12px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Progress
                            </div>
                        </div>
                        {metric.show && (
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: theme.text }}>
                                    {metric.value}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {metric.label}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quote */}
                    {quote && (
                        <p style={{
                            fontSize: '16px',
                            color: theme.muted,
                            fontStyle: 'italic',
                            margin: 0,
                            lineHeight: 1.6
                        }}>
                            "{quote}"
                        </p>
                    )}

                    {/* URL */}
                    {cta.show && cta.url && (
                        <div style={{
                            fontSize: '13px',
                            color: theme.muted,
                            fontFamily: FONTS.technical,
                            marginTop: '10px'
                        }}>
                            {cta.url}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderJourneyFocusLayout = () => {
        const hasProduct = selectedProductImage;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                fontFamily: FONTS[selectedFont],
                overflow: 'hidden'
            }}>
                {/* SVG Journey Path with Mountain */}
                {showMountainPath && (
                    <svg
                        width={format.width}
                        height={format.height}
                        viewBox="0 0 1440 900"
                        preserveAspectRatio="xMidYMid meet"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                        {/* Journey Path - Remaining (dotted) */}
                        <path
                            d={MOUNTAIN_PATH}
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth="4"
                            strokeDasharray="12 12"
                            strokeLinecap="round"
                            fill="none"
                        />

                        {/* Journey Path - Completed (solid glowing) */}
                        <path
                            d={MOUNTAIN_PATH}
                            stroke={theme.accent}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${safeProgress * 16} ${1600 - safeProgress * 16}`}
                            style={{ filter: `drop-shadow(0 0 12px ${theme.glow})` }}
                        />

                        {/* Climber Dot with glow */}
                        {safeProgress > 0 && (
                            <g>
                                <circle cx={climberPoint.x} cy={climberPoint.y} r="22" fill={theme.accent} opacity="0.3" />
                                <circle cx={climberPoint.x} cy={climberPoint.y} r="14" fill={theme.accent} stroke="#ffffff" strokeWidth="3" />
                            </g>
                        )}

                        {/* Goal Flag at Peak */}
                        <g>
                            <line x1={peakPoint.x} y1={peakPoint.y} x2={peakPoint.x} y2={peakPoint.y - 90} stroke={theme.accent} strokeWidth="6" />
                            <path
                                d={`M ${peakPoint.x},${peakPoint.y - 90} L ${peakPoint.x + 75},${peakPoint.y - 65} L ${peakPoint.x},${peakPoint.y - 40} Z`}
                                fill={theme.accent}
                                stroke="#ffffff"
                                strokeWidth="2.5"
                            />
                            <text x={peakPoint.x} y={peakPoint.y - 105} fill={theme.text} fontSize="32" fontWeight="bold" textAnchor="middle"
                                style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.9))' }}>
                                {goalTarget}
                            </text>
                        </g>
                    </svg>
                )}

                {/* Content Overlay */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '40px 60px'
                }}>
                    {/* Left Content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        maxWidth: '50%'
                    }}>
                        <h1 style={{
                            fontSize: `${Math.min(format.width * 0.038, 52)}px`,
                            fontWeight: 800,
                            color: theme.text,
                            margin: 0,
                            lineHeight: 1.1,
                            textShadow: '0 4px 12px rgba(0,0,0,0.9)'
                        }}>
                            {headline}
                        </h1>

                        {quote && (
                            <p style={{
                                fontSize: '18px',
                                color: theme.muted,
                                fontStyle: 'italic',
                                margin: 0,
                                maxWidth: '400px',
                                textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                            }}>
                                "{quote}"
                            </p>
                        )}

                        {/* Stats Row */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            marginTop: '10px',
                            padding: '16px 24px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '16px',
                            backdropFilter: 'blur(10px)',
                            width: 'fit-content',
                            border: `2px solid ${theme.accent}40`,
                            boxShadow: `0 8px 24px rgba(0,0,0,0.5)`
                        }}>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: theme.accent }}>
                                    Day {dayCount}
                                </div>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: theme.muted }} />
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: theme.text }}>
                                    {safeProgress}%
                                </div>
                                <div style={{ fontSize: '11px', color: theme.muted }}>COMPLETE</div>
                            </div>
                            {metric.show && (
                                <>
                                    <div style={{ width: '1px', height: '40px', background: theme.muted }} />
                                    <div>
                                        <div style={{ fontSize: '28px', fontWeight: 800, color: theme.accent }}>
                                            {metric.value}
                                        </div>
                                        <div style={{ fontSize: '11px', color: theme.muted }}>{metric.label.toUpperCase()}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Product (if exists) */}
                    {hasProduct && (
                        <div style={{
                            flex: '0 0 280px',
                            height: '80%',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: `0 25px 50px -12px ${theme.glow}`
                        }}>
                            <img
                                src={selectedProductImage.data}
                                alt="Product"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* URL */}
                {cta.show && cta.url && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '40px',
                        fontSize: '13px',
                        color: theme.muted,
                        fontFamily: FONTS.technical,
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                        {cta.url}
                    </div>
                )}
            </div>
        );
    };

    const renderStatsCardLayout = () => {
        const hasProduct = selectedProductImage;

        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '50px',
                fontFamily: FONTS[selectedFont]
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '30px',
                    maxWidth: '100%'
                }}>
                    {/* Product Card */}
                    {hasProduct && (
                        <div style={{
                            flex: '0 0 200px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: `0 25px 50px -12px ${theme.glow}`
                        }}>
                            <img
                                src={selectedProductImage.data}
                                alt="Product"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {/* Headline */}
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: 800,
                            color: theme.text,
                            margin: 0
                        }}>
                            {headline}
                        </h1>

                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '16px'
                        }}>
                            {/* Day */}
                            <div style={{
                                padding: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 900, color: theme.accent }}>
                                    {dayCount}
                                </div>
                                <div style={{ fontSize: '12px', color: theme.muted, textTransform: 'uppercase' }}>
                                    Days
                                </div>
                            </div>

                            {/* Progress */}
                            <div style={{
                                padding: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 900, color: theme.text }}>
                                    {safeProgress}%
                                </div>
                                <div style={{ fontSize: '12px', color: theme.muted, textTransform: 'uppercase' }}>
                                    Complete
                                </div>
                            </div>

                            {/* Metric */}
                            {metric.show && (
                                <div style={{
                                    padding: '20px',
                                    background: theme.accent,
                                    borderRadius: '16px'
                                }}>
                                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#000' }}>
                                        {metric.value}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase' }}>
                                        {metric.label}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quote */}
                        {quote && (
                            <p style={{
                                fontSize: '14px',
                                color: theme.muted,
                                fontStyle: 'italic',
                                margin: 0
                            }}>
                                "{quote}"
                            </p>
                        )}
                    </div>
                </div>

                {/* URL */}
                {cta.show && cta.url && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '40px',
                        fontSize: '12px',
                        color: theme.muted,
                        fontFamily: FONTS.technical
                    }}>
                        {cta.url}
                    </div>
                )}
            </div>
        );
    };

    const renderMinimalCleanLayout = () => {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                fontFamily: FONTS[selectedFont],
                textAlign: 'center'
            }}>
                {/* Day Badge */}
                <div style={{
                    padding: '8px 20px',
                    background: theme.accent,
                    borderRadius: '30px',
                    marginBottom: '24px'
                }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: theme.bg.includes('#fafafa') ? '#fff' : '#000',
                        letterSpacing: '2px'
                    }}>
                        DAY {dayCount}
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: `${Math.min(format.width * 0.045, 64)}px`,
                    fontWeight: 800,
                    color: theme.text,
                    margin: 0,
                    lineHeight: 1.1,
                    maxWidth: '80%'
                }}>
                    {headline}
                </h1>

                {/* Progress Bar */}
                <div style={{
                    width: '300px',
                    height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    margin: '30px 0',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${safeProgress}%`,
                        height: '100%',
                        background: theme.accent,
                        borderRadius: '3px'
                    }} />
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px'
                }}>
                    <div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: theme.text }}>
                            {safeProgress}%
                        </div>
                        <div style={{ fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Progress
                        </div>
                    </div>
                    {metric.show && (
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: theme.accent }}>
                                {metric.value}
                            </div>
                            <div style={{ fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {metric.label}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quote */}
                {quote && (
                    <p style={{
                        fontSize: '16px',
                        color: theme.muted,
                        fontStyle: 'italic',
                        margin: '30px 0 0 0',
                        maxWidth: '500px'
                    }}>
                        "{quote}"
                    </p>
                )}

                {/* URL */}
                {cta.show && cta.url && (
                    <div style={{
                        position: 'absolute',
                        bottom: '25px',
                        fontSize: '13px',
                        color: theme.muted,
                        fontFamily: FONTS.technical
                    }}>
                        {cta.url}
                    </div>
                )}
            </div>
        );
    };

    const renderLayout = () => {
        switch (selectedLayout) {
            case 'product_hero': return renderProductHeroLayout();
            case 'split_screen': return renderSplitScreenLayout();
            case 'journey_focus': return renderJourneyFocusLayout();
            case 'stats_card': return renderStatsCardLayout();
            case 'minimal_clean': return renderMinimalCleanLayout();
            default: return renderProductHeroLayout();
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
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-7xl bg-[#0F1F3D] border border-white/10 rounded-2xl shadow-2xl relative my-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Product Showcase Banner</h2>
                                    <p className="text-sm text-white/50">Create stunning marketing-ready banners</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-white/50 hover:text-white p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6 p-6">
                            {/* Left: Controls */}
                            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                                {/* Layout Selector */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                        <Layout size={16} />
                                        Layout
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(LAYOUTS).map(([key, lay]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedLayout(key)}
                                                className={`p-3 rounded-xl border-2 transition-all text-center ${
                                                    selectedLayout === key
                                                        ? 'border-brand-teal bg-brand-teal/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{lay.icon}</div>
                                                <div className="text-[10px] text-white font-medium truncate">{lay.name}</div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Mountain Path Toggle - Only for Journey Focus */}
                                    {selectedLayout === 'journey_focus' && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <button
                                                onClick={() => setShowMountainPath(!showMountainPath)}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                                    showMountainPath
                                                        ? 'border-brand-teal bg-brand-teal/10 text-white'
                                                        : 'border-white/10 text-white/50'
                                                }`}
                                            >
                                                Show Mountain Path
                                            </button>
                                            <span className="text-xs text-white/40">
                                                Displays journey progress with goal at peak
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Images */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                        <Image size={16} />
                                        Product Image
                                    </label>
                                    <ProductGallery compact />
                                    {productImages.length > 0 && (
                                        <div className="mt-3">
                                            <label className="text-xs text-white/50 mb-2 block">Select for banner:</label>
                                            <div className="flex gap-2">
                                                {productImages.map((img) => (
                                                    <button
                                                        key={img.id}
                                                        onClick={() => setSelectedProductImage(img)}
                                                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                                            selectedProductImage?.id === img.id
                                                                ? 'border-brand-teal'
                                                                : 'border-white/10'
                                                        }`}
                                                    >
                                                        <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Inputs */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">Headline</label>
                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            placeholder="Your main message"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">Goal Target (Peak)</label>
                                            <input
                                                type="text"
                                                value={goalTarget}
                                                onChange={(e) => setGoalTarget(e.target.value)}
                                                placeholder="$1K MRR"
                                                className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">Day</label>
                                            <input
                                                type="text"
                                                value={dayCount}
                                                onChange={(e) => setDayCount(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:border-brand-teal focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">Current Metric Value</label>
                                        <input
                                            type="text"
                                            value={metric.value}
                                            onChange={(e) => setMetric({ ...metric, value: e.target.value })}
                                            placeholder="$347"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">Quote / Learning</label>
                                        <textarea
                                            value={quote}
                                            onChange={(e) => setQuote(e.target.value)}
                                            placeholder="Share your insight..."
                                            rows={2}
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">Your URL</label>
                                        <input
                                            type="text"
                                            value={cta.url}
                                            onChange={(e) => setCta({ ...cta, url: e.target.value })}
                                            placeholder="yoursite.com"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Theme Selector */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                        <Palette size={16} />
                                        Theme
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(THEMES).map(([key, thm]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTheme(key)}
                                                className={`p-2 rounded-xl border-2 transition-all ${
                                                    selectedTheme === key
                                                        ? 'border-brand-teal'
                                                        : 'border-white/10'
                                                }`}
                                            >
                                                <div
                                                    className="w-full h-8 rounded-lg mb-1"
                                                    style={{ background: thm.bg }}
                                                />
                                                <div className="text-[10px] text-white font-medium">{thm.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format Selector */}
                                <div>
                                    <label className="text-sm font-bold text-white mb-3 block">Export Format</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(EXPORT_FORMATS).map(([key, fmt]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedFormat(key)}
                                                className={`p-2 rounded-xl border-2 transition-all ${
                                                    selectedFormat === key
                                                        ? 'border-brand-teal bg-brand-teal/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="text-lg mb-1">{fmt.icon}</div>
                                                <div className="text-[10px] font-bold text-white">{fmt.name}</div>
                                                <div className="text-[9px] text-white/40">{fmt.width}×{fmt.height}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tweet Preview Section */}
                                <div className="pt-3 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                            </svg>
                                            Tweet Preview
                                        </label>
                                        <button
                                            onClick={handleCopyTweet}
                                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            <Copy size={12} />
                                            {copySuccess ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="p-3 bg-black/40 rounded-xl border border-white/10 max-h-28 overflow-y-auto">
                                        <p className="text-white/80 text-xs whitespace-pre-wrap leading-relaxed">{bannerTweetText}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-3">
                                    {/* Primary: Share to X */}
                                    <button
                                        onClick={handleShareToX}
                                        disabled={isGenerating || !previewUrl}
                                        className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-base border border-white/20 hover:border-white/40"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        {isGenerating ? 'Generating...' : 'Share to X (Download + Copy)'}
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        onClick={handleShareToLinkedIn}
                                        disabled={isGenerating || !previewUrl}
                                        className="w-full py-3 bg-[#0A66C2] text-white font-bold rounded-xl hover:bg-[#004182] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        Share to LinkedIn
                                    </button>

                                    {/* Secondary actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleDownload}
                                            disabled={isGenerating || !previewUrl}
                                            className="py-2.5 bg-brand-teal/20 text-brand-teal border border-brand-teal/30 font-bold rounded-xl hover:bg-brand-teal/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                        <button
                                            onClick={handleCopyImage}
                                            disabled={isGenerating || !previewUrl}
                                            className="py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold rounded-xl hover:bg-purple-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Copy size={16} />
                                            Copy Image
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <label className="text-sm font-bold text-white mb-3 block">Live Preview</label>
                                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 min-h-[400px] flex items-center justify-center">
                                    {isGenerating ? (
                                        <div className="text-center">
                                            <div className="w-10 h-10 border-3 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-white/60 text-sm">Rendering...</p>
                                        </div>
                                    ) : previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Banner Preview"
                                            className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
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
                                    background: theme.bg
                                }}
                            >
                                {renderLayout()}
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
