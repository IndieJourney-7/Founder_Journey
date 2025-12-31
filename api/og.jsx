import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

// Mountain SVG path for the visualization
const MountainPath = ({ progress, color }) => {
    const climbHeight = Math.min(progress, 100);

    return (
        <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ position: 'absolute', right: 40, bottom: 40 }}
        >
            {/* Mountain shape */}
            <path
                d="M100 20 L180 180 L20 180 Z"
                fill="#1a365d"
                stroke="#E7C778"
                strokeWidth="2"
            />
            {/* Snow cap */}
            <path
                d="M100 20 L120 60 L80 60 Z"
                fill="white"
                opacity="0.9"
            />
            {/* Progress fill */}
            <clipPath id="progressClip">
                <rect
                    x="0"
                    y={200 - (climbHeight * 1.6)}
                    width="200"
                    height={climbHeight * 1.6}
                />
            </clipPath>
            <path
                d="M100 20 L180 180 L20 180 Z"
                fill={color || '#4CD4C0'}
                opacity="0.6"
                clipPath="url(#progressClip)"
            />
            {/* Climber dot */}
            <circle
                cx={100 + (50 - climbHeight * 0.5) * (climbHeight > 50 ? -1 : 1) * 0.3}
                cy={180 - (climbHeight * 1.6)}
                r="8"
                fill="#E7C778"
                stroke="white"
                strokeWidth="2"
            />
        </svg>
    );
};

export default async function handler(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get parameters from URL
        const username = searchParams.get('username') || 'founder';
        const title = searchParams.get('title') || 'My Journey';
        const progress = parseInt(searchParams.get('progress') || '0');
        const target = searchParams.get('target') || '';
        const cheers = parseInt(searchParams.get('cheers') || '0');
        const days = parseInt(searchParams.get('days') || '0');
        const type = searchParams.get('type') || 'profile'; // profile, milestone, weekly

        // Milestone-specific
        const milestone = searchParams.get('milestone') || '';

        // Colors
        const brandBlue = '#0F1F3D';
        const brandGold = '#E7C778';
        const brandTeal = '#4CD4C0';

        // Different layouts based on type
        if (type === 'milestone') {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${brandBlue} 0%, #1a365d 50%, #0a1929 100%)`,
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        {/* Celebration burst */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at center, ${brandGold}20 0%, transparent 50%)`,
                            }}
                        />

                        {/* Milestone badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${brandGold}, #FCD34D)`,
                                marginBottom: 24,
                                boxShadow: `0 0 60px ${brandGold}60`,
                            }}
                        >
                            <span style={{ fontSize: 48 }}>
                                {milestone === '100' ? '🏆' : milestone === '75' ? '⭐' : milestone === '50' ? '🎯' : '🚀'}
                            </span>
                        </div>

                        {/* Milestone text */}
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                color: 'white',
                                marginBottom: 8,
                            }}
                        >
                            {milestone}% Complete!
                        </div>

                        <div
                            style={{
                                fontSize: 28,
                                color: brandTeal,
                                marginBottom: 24,
                            }}
                        >
                            {milestone === '100' ? 'Summit Reached!' : milestone === '75' ? 'Almost there!' : milestone === '50' ? 'Halfway Point!' : 'Quarter Way There!'}
                        </div>

                        {/* Journey info */}
                        <div
                            style={{
                                fontSize: 24,
                                color: 'white',
                                opacity: 0.8,
                                marginBottom: 8,
                            }}
                        >
                            @{username}'s journey to
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: brandGold,
                                maxWidth: 800,
                                textAlign: 'center',
                            }}
                        >
                            "{title}"
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 40,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <span style={{ fontSize: 24, color: 'white', opacity: 0.6 }}>
                                SHIFT ASCENT
                            </span>
                        </div>
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        // Default: Profile OG image
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: `linear-gradient(135deg, ${brandBlue} 0%, #1a365d 50%, #0a1929 100%)`,
                        fontFamily: 'system-ui, sans-serif',
                        padding: 60,
                        position: 'relative',
                    }}
                >
                    {/* Top section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
                        {/* Avatar */}
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${brandGold}, #FCD34D)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 36,
                                fontWeight: 700,
                                color: brandBlue,
                            }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>
                                @{username}
                            </span>
                            <span style={{ fontSize: 20, color: 'white', opacity: 0.6 }}>
                                Building in public
                            </span>
                        </div>
                    </div>

                    {/* Journey title */}
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 900,
                            color: 'white',
                            marginBottom: 16,
                            maxWidth: 700,
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </div>

                    {/* Target */}
                    {target && (
                        <div
                            style={{
                                fontSize: 24,
                                color: brandTeal,
                                marginBottom: 32,
                                maxWidth: 600,
                            }}
                        >
                            {target}
                        </div>
                    )}

                    {/* Progress bar */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            marginTop: 'auto',
                            marginBottom: 20,
                            maxWidth: 600,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 18, color: 'white', opacity: 0.6 }}>Progress</span>
                            <span style={{ fontSize: 24, fontWeight: 700, color: brandGold }}>{progress}%</span>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: 16,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${brandTeal}, ${brandGold})`,
                                    borderRadius: 8,
                                }}
                            />
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 40 }}>
                        {cheers > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 24 }}>🔥</span>
                                <span style={{ fontSize: 20, color: 'white' }}>{cheers} cheers</span>
                            </div>
                        )}
                        {days > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 24 }}>📅</span>
                                <span style={{ fontSize: 20, color: 'white' }}>Day {days}</span>
                            </div>
                        )}
                    </div>

                    {/* Mountain visualization (right side) */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 60,
                            bottom: 60,
                            width: 200,
                            height: 200,
                        }}
                    >
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {/* Mountain shape */}
                            <path
                                d="M100 20 L180 180 L20 180 Z"
                                fill="#1a365d"
                                stroke={brandGold}
                                strokeWidth="2"
                            />
                            {/* Snow cap */}
                            <path
                                d="M100 20 L115 50 L85 50 Z"
                                fill="white"
                                opacity="0.9"
                            />
                            {/* Progress fill */}
                            <defs>
                                <clipPath id="prog">
                                    <rect x="0" y={180 - (progress * 1.6)} width="200" height={progress * 1.6} />
                                </clipPath>
                            </defs>
                            <path
                                d="M100 20 L180 180 L20 180 Z"
                                fill={brandTeal}
                                opacity="0.5"
                                clipPath="url(#prog)"
                            />
                            {/* Flag at current position */}
                            <g transform={`translate(${100}, ${180 - (progress * 1.6)})`}>
                                <line x1="0" y1="0" x2="0" y2="-20" stroke={brandGold} strokeWidth="2" />
                                <path d="M0 -20 L15 -15 L0 -10 Z" fill={brandGold} />
                            </g>
                        </svg>
                    </div>

                    {/* Branding */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            left: 60,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span style={{ fontSize: 18, color: 'white', opacity: 0.5 }}>
                            shiftascent.com
                        </span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e) {
        console.error(e);
        return new Response(`Failed to generate image: ${e.message}`, {
            status: 500,
        });
    }
}
