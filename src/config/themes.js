/**
 * Animated Theme Configurations for Mountain View
 * Each theme includes colors, particle effects, and ambient settings
 */

export const ANIMATED_THEMES = {
    newYear2026: {
        id: 'newYear2026',
        name: '🎆 New Year 2026',
        description: 'Celebrate with fireworks & golden sparkles',
        category: 'seasonal',
        isSpecial: true,
        badge: '✨ LIMITED',

        // Sky gradient colors
        sky: {
            from: '#0C0A20',
            via: '#1A103D',
            to: '#0F0825',
        },

        // Mountain layer colors
        mountains: {
            back: '#2D1F5C',
            backOpacity: 0.5,
            mid: '#1F1445',
            midOpacity: 0.7,
            front: {
                start: '#3D2878',
                end: '#0F0825',
            }
        },

        // Particle configuration
        particles: {
            theme: 'newYear2026',
            intensity: 1.2,
        },

        // Special overlays
        overlays: {
            gradient: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.1) 0%, transparent 60%)',
            vignette: true,
        },

        // Ambient glow colors
        glow: {
            primary: 'rgba(255, 215, 0, 0.3)',
            secondary: 'rgba(168, 85, 247, 0.2)',
        },

        // Text styling for "2026" overlay
        specialText: {
            show: true,
            text: '2026',
            className: 'text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 opacity-20',
        }
    },

    winterWonder: {
        id: 'winterWonder',
        name: '❄️ Winter Wonder',
        description: 'Peaceful snowfall & northern lights',
        category: 'nature',
        isSpecial: false,

        sky: {
            from: '#0B1929',
            via: '#0F2847',
            to: '#061220',
        },

        mountains: {
            back: '#1E3A5F',
            backOpacity: 0.4,
            mid: '#152D4A',
            midOpacity: 0.6,
            front: {
                start: '#2A4A7A',
                end: '#0A1525',
            }
        },

        particles: {
            theme: 'winterWonder',
            intensity: 1.5,
        },

        overlays: {
            gradient: 'linear-gradient(180deg, rgba(100,200,255,0.05) 0%, transparent 40%)',
            aurora: true,
            vignette: true,
        },

        glow: {
            primary: 'rgba(100, 200, 255, 0.15)',
            secondary: 'rgba(150, 255, 200, 0.1)',
        },

        specialText: {
            show: false,
        }
    },

    springBloom: {
        id: 'springBloom',
        name: '🌸 Spring Bloom',
        description: 'Cherry blossoms & butterflies',
        category: 'nature',
        isSpecial: false,

        sky: {
            from: '#FDF2F8',
            via: '#FBCFE8',
            to: '#F9A8D4',
        },

        mountains: {
            back: '#F9A8D4',
            backOpacity: 0.3,
            mid: '#F472B6',
            midOpacity: 0.4,
            front: {
                start: '#EC4899',
                end: '#BE185D',
            }
        },

        particles: {
            theme: 'springBloom',
            intensity: 1,
        },

        overlays: {
            gradient: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            vignette: false,
        },

        glow: {
            primary: 'rgba(244, 114, 182, 0.2)',
            secondary: 'rgba(255, 255, 255, 0.3)',
        },

        specialText: {
            show: false,
        },

        // Light theme flag for text colors
        isLight: true,
    },

    midnightFocus: {
        id: 'midnightFocus',
        name: '🌙 Midnight Focus',
        description: 'Deep night sky with shooting stars',
        category: 'focus',
        isSpecial: false,

        sky: {
            from: '#020617',
            via: '#0F172A',
            to: '#020617',
        },

        mountains: {
            back: '#1E293B',
            backOpacity: 0.4,
            mid: '#0F172A',
            midOpacity: 0.6,
            front: {
                start: '#1E293B',
                end: '#020617',
            }
        },

        particles: {
            theme: 'midnightFocus',
            intensity: 0.8,
        },

        overlays: {
            gradient: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)',
            vignette: true,
        },

        glow: {
            primary: 'rgba(99, 102, 241, 0.15)',
            secondary: 'rgba(139, 92, 246, 0.1)',
        },

        specialText: {
            show: false,
        }
    },

    goldenHour: {
        id: 'goldenHour',
        name: '🌅 Golden Hour',
        description: 'Warm sunset rays & floating dust',
        category: 'nature',
        isSpecial: false,

        sky: {
            from: '#FEF3C7',
            via: '#FDE68A',
            to: '#F59E0B',
        },

        mountains: {
            back: '#D97706',
            backOpacity: 0.3,
            mid: '#B45309',
            midOpacity: 0.5,
            front: {
                start: '#92400E',
                end: '#451A03',
            }
        },

        particles: {
            theme: 'goldenHour',
            intensity: 0.7,
        },

        overlays: {
            gradient: 'radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.4) 0%, transparent 40%)',
            vignette: true,
        },

        glow: {
            primary: 'rgba(251, 191, 36, 0.3)',
            secondary: 'rgba(255, 255, 255, 0.2)',
        },

        specialText: {
            show: false,
        },

        isLight: true,
    },

    rainyDay: {
        id: 'rainyDay',
        name: '🌧️ Rainy Day',
        description: 'Cozy rain & gentle ripples',
        category: 'focus',
        isSpecial: false,

        sky: {
            from: '#374151',
            via: '#4B5563',
            to: '#1F2937',
        },

        mountains: {
            back: '#4B5563',
            backOpacity: 0.4,
            mid: '#374151',
            midOpacity: 0.6,
            front: {
                start: '#1F2937',
                end: '#111827',
            }
        },

        particles: {
            theme: 'rainyDay',
            intensity: 1.3,
        },

        overlays: {
            gradient: 'linear-gradient(180deg, rgba(100,150,200,0.1) 0%, transparent 30%)',
            vignette: true,
            rainOverlay: true,
        },

        glow: {
            primary: 'rgba(59, 130, 246, 0.1)',
            secondary: 'rgba(107, 114, 128, 0.1)',
        },

        specialText: {
            show: false,
        }
    },

    // Default/Classic theme
    classic: {
        id: 'classic',
        name: '🏔️ Classic Mountain',
        description: 'The original mountain experience',
        category: 'default',
        isSpecial: false,

        sky: {
            from: '#4E6ED0',
            via: '#1E3A8A',
            to: '#0F1F3D',
        },

        mountains: {
            back: '#1a3a6e',
            backOpacity: 0.4,
            mid: '#152c5b',
            midOpacity: 0.7,
            front: {
                start: '#2A4A8A',
                end: '#0F1F3D',
            }
        },

        particles: {
            theme: 'default',
            intensity: 0.5,
        },

        overlays: {
            gradient: 'none',
            vignette: false,
        },

        glow: {
            primary: 'rgba(78, 110, 208, 0.1)',
            secondary: 'transparent',
        },

        specialText: {
            show: false,
        }
    }
};

// Theme categories for organization
export const THEME_CATEGORIES = [
    { id: 'seasonal', name: '🎉 Seasonal', description: 'Limited time themes' },
    { id: 'nature', name: '🌿 Nature', description: 'Inspired by the natural world' },
    { id: 'focus', name: '🧘 Focus', description: 'Calm environments for deep work' },
    { id: 'default', name: '📦 Default', description: 'Classic themes' },
];

// Get theme by ID
export const getTheme = (themeId) => {
    return ANIMATED_THEMES[themeId] || ANIMATED_THEMES.classic;
};

// Get all themes as array
export const getAllThemes = () => {
    return Object.values(ANIMATED_THEMES);
};

// Get themes by category
export const getThemesByCategory = (category) => {
    return Object.values(ANIMATED_THEMES).filter(theme => theme.category === category);
};

// Get special/limited themes
export const getSpecialThemes = () => {
    return Object.values(ANIMATED_THEMES).filter(theme => theme.isSpecial);
};

// Default theme ID
export const DEFAULT_THEME_ID = 'newYear2026'; // Special default for the season!
