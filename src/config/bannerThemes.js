/**
 * Banner Export Themes with Static Decorations
 * Maps animated themes to banner-friendly static elements
 */

import { ANIMATED_THEMES } from './themes';

// Static decoration generators for banners
export const BANNER_DECORATIONS = {
    // New Year 2026 - Fireworks bursts + sparkles
    newYear2026: {
        elements: [
            // Firework burst 1 (top right)
            { type: 'firework', x: '85%', y: '15%', size: 120, color: '#FFD700', delay: 0 },
            // Firework burst 2 (top left)
            { type: 'firework', x: '15%', y: '20%', size: 80, color: '#FF6B6B', delay: 0.2 },
            // Firework burst 3 (center top)
            { type: 'firework', x: '50%', y: '10%', size: 100, color: '#A855F7', delay: 0.1 },
            // Sparkles scattered
            { type: 'sparkle', x: '30%', y: '25%', size: 15, color: '#FFD700' },
            { type: 'sparkle', x: '70%', y: '30%', size: 12, color: '#FFD700' },
            { type: 'sparkle', x: '20%', y: '40%', size: 10, color: '#FFF' },
            { type: 'sparkle', x: '80%', y: '35%', size: 14, color: '#FFF' },
            { type: 'sparkle', x: '60%', y: '20%', size: 8, color: '#A855F7' },
            { type: 'sparkle', x: '40%', y: '15%', size: 11, color: '#FF6B6B' },
        ],
        overlay: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.15) 0%, transparent 50%)',
    },

    // Winter Wonder - Snowflakes
    winterWonder: {
        elements: [
            // Large snowflakes
            { type: 'snowflake', x: '10%', y: '15%', size: 30, opacity: 0.8 },
            { type: 'snowflake', x: '90%', y: '20%', size: 35, opacity: 0.7 },
            { type: 'snowflake', x: '25%', y: '35%', size: 25, opacity: 0.6 },
            { type: 'snowflake', x: '75%', y: '40%', size: 28, opacity: 0.5 },
            { type: 'snowflake', x: '50%', y: '10%', size: 32, opacity: 0.9 },
            // Medium snowflakes
            { type: 'snowflake', x: '15%', y: '50%', size: 18, opacity: 0.5 },
            { type: 'snowflake', x: '85%', y: '55%', size: 20, opacity: 0.4 },
            { type: 'snowflake', x: '35%', y: '25%', size: 22, opacity: 0.6 },
            { type: 'snowflake', x: '65%', y: '30%', size: 16, opacity: 0.5 },
            // Small snowflakes (dots)
            { type: 'snow-dot', x: '5%', y: '30%', size: 6, opacity: 0.4 },
            { type: 'snow-dot', x: '95%', y: '35%', size: 5, opacity: 0.3 },
            { type: 'snow-dot', x: '45%', y: '45%', size: 4, opacity: 0.5 },
            { type: 'snow-dot', x: '55%', y: '20%', size: 5, opacity: 0.4 },
            { type: 'snow-dot', x: '20%', y: '60%', size: 4, opacity: 0.3 },
            { type: 'snow-dot', x: '80%', y: '65%', size: 5, opacity: 0.4 },
        ],
        overlay: 'linear-gradient(180deg, rgba(200,230,255,0.1) 0%, transparent 40%)',
    },

    // Spring Bloom - Cherry blossoms + butterflies
    springBloom: {
        elements: [
            // Cherry blossoms (petals)
            { type: 'petal', x: '10%', y: '20%', size: 20, rotation: 45, color: '#FFB7C5' },
            { type: 'petal', x: '25%', y: '35%', size: 16, rotation: 120, color: '#FFC1CC' },
            { type: 'petal', x: '85%', y: '25%', size: 22, rotation: 200, color: '#FFB7C5' },
            { type: 'petal', x: '70%', y: '40%', size: 18, rotation: 80, color: '#FFDDE2' },
            { type: 'petal', x: '40%', y: '15%', size: 14, rotation: 160, color: '#FFB7C5' },
            { type: 'petal', x: '60%', y: '30%', size: 20, rotation: 30, color: '#FFC1CC' },
            { type: 'petal', x: '15%', y: '55%', size: 12, rotation: 270, color: '#FFDDE2' },
            { type: 'petal', x: '90%', y: '50%', size: 15, rotation: 100, color: '#FFB7C5' },
            // Butterflies
            { type: 'butterfly', x: '30%', y: '25%', size: 24, color: '#EC4899' },
            { type: 'butterfly', x: '75%', y: '35%', size: 20, color: '#F472B6' },
        ],
        overlay: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
    },

    // Midnight Focus - Stars + shooting stars
    midnightFocus: {
        elements: [
            // Stars
            { type: 'star', x: '10%', y: '10%', size: 3, opacity: 0.9 },
            { type: 'star', x: '25%', y: '20%', size: 2, opacity: 0.7 },
            { type: 'star', x: '40%', y: '8%', size: 4, opacity: 0.8 },
            { type: 'star', x: '60%', y: '15%', size: 2, opacity: 0.6 },
            { type: 'star', x: '75%', y: '12%', size: 3, opacity: 0.9 },
            { type: 'star', x: '90%', y: '25%', size: 2, opacity: 0.5 },
            { type: 'star', x: '5%', y: '35%', size: 2, opacity: 0.7 },
            { type: 'star', x: '95%', y: '40%', size: 3, opacity: 0.8 },
            { type: 'star', x: '50%', y: '5%', size: 4, opacity: 1 },
            { type: 'star', x: '35%', y: '30%', size: 2, opacity: 0.6 },
            { type: 'star', x: '80%', y: '8%', size: 3, opacity: 0.8 },
            { type: 'star', x: '15%', y: '45%', size: 2, opacity: 0.5 },
            // Shooting stars
            { type: 'shooting-star', x: '70%', y: '15%', length: 60, angle: 35 },
            { type: 'shooting-star', x: '20%', y: '25%', length: 45, angle: 30 },
        ],
        overlay: 'radial-gradient(ellipse at 40% 20%, rgba(99,102,241,0.15) 0%, transparent 50%)',
    },

    // Golden Hour - Sun rays + floating dust
    goldenHour: {
        elements: [
            // Sun glow
            { type: 'sun-glow', x: '80%', y: '25%', size: 150 },
            // Sun rays
            { type: 'sun-ray', x: '80%', y: '25%', length: 200, angle: 200 },
            { type: 'sun-ray', x: '80%', y: '25%', length: 180, angle: 220 },
            { type: 'sun-ray', x: '80%', y: '25%', length: 220, angle: 240 },
            { type: 'sun-ray', x: '80%', y: '25%', length: 190, angle: 260 },
            // Dust particles
            { type: 'dust', x: '15%', y: '40%', size: 4, opacity: 0.6 },
            { type: 'dust', x: '30%', y: '35%', size: 3, opacity: 0.5 },
            { type: 'dust', x: '45%', y: '50%', size: 5, opacity: 0.4 },
            { type: 'dust', x: '60%', y: '45%', size: 3, opacity: 0.6 },
            { type: 'dust', x: '25%', y: '55%', size: 4, opacity: 0.5 },
            { type: 'dust', x: '50%', y: '30%', size: 3, opacity: 0.4 },
        ],
        overlay: 'radial-gradient(ellipse at 80% 25%, rgba(255,200,100,0.3) 0%, transparent 50%)',
    },

    // Rainy Day - Rain streaks
    rainyDay: {
        elements: [
            // Rain streaks
            { type: 'rain', x: '5%', y: '0%', length: 40, opacity: 0.3 },
            { type: 'rain', x: '15%', y: '5%', length: 35, opacity: 0.4 },
            { type: 'rain', x: '25%', y: '2%', length: 45, opacity: 0.3 },
            { type: 'rain', x: '35%', y: '8%', length: 38, opacity: 0.5 },
            { type: 'rain', x: '45%', y: '3%', length: 42, opacity: 0.4 },
            { type: 'rain', x: '55%', y: '6%', length: 36, opacity: 0.3 },
            { type: 'rain', x: '65%', y: '1%', length: 40, opacity: 0.4 },
            { type: 'rain', x: '75%', y: '4%', length: 44, opacity: 0.5 },
            { type: 'rain', x: '85%', y: '7%', length: 38, opacity: 0.3 },
            { type: 'rain', x: '95%', y: '2%', length: 42, opacity: 0.4 },
            // More rain (offset)
            { type: 'rain', x: '10%', y: '15%', length: 35, opacity: 0.25 },
            { type: 'rain', x: '30%', y: '20%', length: 40, opacity: 0.3 },
            { type: 'rain', x: '50%', y: '18%', length: 38, opacity: 0.35 },
            { type: 'rain', x: '70%', y: '22%', length: 42, opacity: 0.3 },
            { type: 'rain', x: '90%', y: '16%', length: 36, opacity: 0.25 },
        ],
        overlay: 'linear-gradient(180deg, rgba(100,130,160,0.15) 0%, transparent 40%)',
    },

    // Classic - Subtle stars only
    classic: {
        elements: [
            { type: 'star', x: '15%', y: '15%', size: 2, opacity: 0.5 },
            { type: 'star', x: '85%', y: '20%', size: 3, opacity: 0.6 },
            { type: 'star', x: '50%', y: '10%', size: 2, opacity: 0.4 },
        ],
        overlay: 'none',
    },
};

// Convert animated theme to banner theme format
export const getBannerThemeFromAnimated = (themeId) => {
    const animatedTheme = ANIMATED_THEMES[themeId];
    if (!animatedTheme) return null;

    const decorations = BANNER_DECORATIONS[themeId] || BANNER_DECORATIONS.classic;

    return {
        id: themeId,
        name: animatedTheme.name,
        isAnimated: true,
        // Convert sky gradient to CSS
        bg: `linear-gradient(135deg, ${animatedTheme.sky.from} 0%, ${animatedTheme.sky.via || animatedTheme.sky.to} 50%, ${animatedTheme.sky.to} 100%)`,
        // Use mountain front color as accent
        accent: animatedTheme.glow?.primary?.replace(/[^,]+\)$/, '1)') || '#E7C778',
        // Text colors
        text: animatedTheme.isLight ? '#1a1a2e' : '#ffffff',
        muted: animatedTheme.isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
        glow: animatedTheme.glow?.primary || 'rgba(255,255,255,0.2)',
        // Decorations
        decorations: decorations.elements,
        overlay: decorations.overlay,
        // Original theme reference
        originalTheme: animatedTheme,
    };
};

// Get all animated themes as banner themes
export const getAllBannerThemes = () => {
    return Object.keys(ANIMATED_THEMES).map(id => getBannerThemeFromAnimated(id)).filter(Boolean);
};

// SVG decoration renderer helpers
export const renderDecoration = (element, index, width, height) => {
    const x = parseFloat(element.x) / 100 * width;
    const y = parseFloat(element.y) / 100 * height;

    switch (element.type) {
        case 'firework':
            return renderFirework(x, y, element.size, element.color, index);
        case 'sparkle':
            return renderSparkle(x, y, element.size, element.color, index);
        case 'snowflake':
            return renderSnowflake(x, y, element.size, element.opacity, index);
        case 'snow-dot':
            return renderSnowDot(x, y, element.size, element.opacity, index);
        case 'petal':
            return renderPetal(x, y, element.size, element.rotation, element.color, index);
        case 'butterfly':
            return renderButterfly(x, y, element.size, element.color, index);
        case 'star':
            return renderStar(x, y, element.size, element.opacity, index);
        case 'shooting-star':
            return renderShootingStar(x, y, element.length, element.angle, index);
        case 'sun-glow':
            return renderSunGlow(x, y, element.size, index);
        case 'sun-ray':
            return renderSunRay(x, y, element.length, element.angle, index);
        case 'dust':
            return renderDust(x, y, element.size, element.opacity, index);
        case 'rain':
            return renderRain(x, y, element.length, element.opacity, index);
        default:
            return null;
    }
};

// Individual decoration renderers (return SVG elements as strings for html2canvas)
const renderFirework = (x, y, size, color, key) => ({
    type: 'firework',
    key,
    render: `
        <g transform="translate(${x}, ${y})">
            ${Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const lineLength = size * (0.7 + Math.random() * 0.3);
                const x2 = Math.cos(angle) * lineLength;
                const y2 = Math.sin(angle) * lineLength;
                return `<line x1="0" y1="0" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
            }).join('')}
            <circle cx="0" cy="0" r="${size * 0.15}" fill="${color}" opacity="0.9"/>
            ${Array.from({ length: 8 }, (_, i) => {
                const angle = ((i * 45) + 22.5) * Math.PI / 180;
                const dist = size * 1.1;
                const cx = Math.cos(angle) * dist;
                const cy = Math.sin(angle) * dist;
                return `<circle cx="${cx}" cy="${cy}" r="3" fill="${color}" opacity="0.6"/>`;
            }).join('')}
        </g>
    `
});

const renderSparkle = (x, y, size, color, key) => ({
    type: 'sparkle',
    key,
    render: `
        <g transform="translate(${x}, ${y})">
            <path d="M0 ${-size} L${size*0.3} 0 L0 ${size} L${-size*0.3} 0 Z" fill="${color}" opacity="0.9"/>
            <path d="M${-size} 0 L0 ${size*0.3} L${size} 0 L0 ${-size*0.3} Z" fill="${color}" opacity="0.9"/>
        </g>
    `
});

const renderSnowflake = (x, y, size, opacity, key) => ({
    type: 'snowflake',
    key,
    render: `
        <g transform="translate(${x}, ${y})" opacity="${opacity}">
            ${Array.from({ length: 6 }, (_, i) => {
                const angle = i * 60;
                return `
                    <g transform="rotate(${angle})">
                        <line x1="0" y1="0" x2="0" y2="${-size}" stroke="white" stroke-width="2"/>
                        <line x1="0" y1="${-size*0.5}" x2="${size*0.25}" y2="${-size*0.7}" stroke="white" stroke-width="1.5"/>
                        <line x1="0" y1="${-size*0.5}" x2="${-size*0.25}" y2="${-size*0.7}" stroke="white" stroke-width="1.5"/>
                    </g>
                `;
            }).join('')}
            <circle cx="0" cy="0" r="${size*0.15}" fill="white"/>
        </g>
    `
});

const renderSnowDot = (x, y, size, opacity, key) => ({
    type: 'snow-dot',
    key,
    render: `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`
});

const renderPetal = (x, y, size, rotation, color, key) => ({
    type: 'petal',
    key,
    render: `
        <g transform="translate(${x}, ${y}) rotate(${rotation})">
            <ellipse cx="0" cy="0" rx="${size}" ry="${size*0.5}" fill="${color}" opacity="0.8"/>
            <ellipse cx="0" cy="${size*0.1}" rx="${size*0.6}" ry="${size*0.3}" fill="${color}" opacity="0.5"/>
        </g>
    `
});

const renderButterfly = (x, y, size, color, key) => ({
    type: 'butterfly',
    key,
    render: `
        <g transform="translate(${x}, ${y})">
            <ellipse cx="${-size*0.4}" cy="0" rx="${size*0.5}" ry="${size*0.35}" fill="${color}" opacity="0.8"/>
            <ellipse cx="${size*0.4}" cy="0" rx="${size*0.5}" ry="${size*0.35}" fill="${color}" opacity="0.8"/>
            <ellipse cx="${-size*0.3}" cy="${size*0.3}" rx="${size*0.3}" ry="${size*0.2}" fill="${color}" opacity="0.6"/>
            <ellipse cx="${size*0.3}" cy="${size*0.3}" rx="${size*0.3}" ry="${size*0.2}" fill="${color}" opacity="0.6"/>
            <line x1="0" y1="${-size*0.2}" x2="0" y2="${size*0.4}" stroke="${color}" stroke-width="2"/>
        </g>
    `
});

const renderStar = (x, y, size, opacity, key) => ({
    type: 'star',
    key,
    render: `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`
});

const renderShootingStar = (x, y, length, angle, key) => {
    const rad = angle * Math.PI / 180;
    const x2 = x + Math.cos(rad) * length;
    const y2 = y + Math.sin(rad) * length;
    return {
        type: 'shooting-star',
        key,
        render: `
            <defs>
                <linearGradient id="shootingGrad${key}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:white;stop-opacity:0.9"/>
                    <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
                </linearGradient>
            </defs>
            <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="url(#shootingGrad${key})" stroke-width="2" stroke-linecap="round"/>
            <circle cx="${x}" cy="${y}" r="3" fill="white" opacity="0.9"/>
        `
    };
};

const renderSunGlow = (x, y, size, key) => ({
    type: 'sun-glow',
    key,
    render: `
        <defs>
            <radialGradient id="sunGlow${key}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FFF7ED;stop-opacity:0.6"/>
                <stop offset="50%" style="stop-color:#FBBF24;stop-opacity:0.3"/>
                <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0"/>
            </radialGradient>
        </defs>
        <circle cx="${x}" cy="${y}" r="${size}" fill="url(#sunGlow${key})"/>
    `
});

const renderSunRay = (x, y, length, angle, key) => {
    const rad = angle * Math.PI / 180;
    const x2 = x + Math.cos(rad) * length;
    const y2 = y + Math.sin(rad) * length;
    return {
        type: 'sun-ray',
        key,
        render: `
            <defs>
                <linearGradient id="rayGrad${key}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#FDE68A;stop-opacity:0.4"/>
                    <stop offset="100%" style="stop-color:#FDE68A;stop-opacity:0"/>
                </linearGradient>
            </defs>
            <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="url(#rayGrad${key})" stroke-width="20" stroke-linecap="round"/>
        `
    };
};

const renderDust = (x, y, size, opacity, key) => ({
    type: 'dust',
    key,
    render: `<circle cx="${x}" cy="${y}" r="${size}" fill="#FDE68A" opacity="${opacity}"/>`
});

const renderRain = (x, y, length, opacity, key) => ({
    type: 'rain',
    key,
    render: `
        <line x1="${x}" y1="${y}" x2="${x + length * 0.3}" y2="${y + length}"
              stroke="rgba(200,220,240,${opacity})" stroke-width="1.5" stroke-linecap="round"/>
    `
});

// Generate complete SVG decorations string
export const generateDecorationsSVG = (themeId, width, height) => {
    const decorations = BANNER_DECORATIONS[themeId];
    if (!decorations?.elements) return '';

    const svgElements = decorations.elements.map((el, i) => {
        const decoration = renderDecoration(el, i, width, height);
        return decoration?.render || '';
    }).join('');

    return `
        <svg width="${width}" height="${height}"
             style="position:absolute;top:0;left:0;pointer-events:none;"
             xmlns="http://www.w3.org/2000/svg">
            ${svgElements}
        </svg>
    `;
};
