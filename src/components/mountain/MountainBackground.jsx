import React, { useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import ParticleCanvas from './ParticleCanvas';

// Aurora Borealis component for Winter Wonder theme
const AuroraBorealis = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute top-0 left-0 w-full h-1/2"
                style={{
                    background: 'linear-gradient(180deg, rgba(100,255,200,0.15) 0%, rgba(100,200,255,0.1) 30%, transparent 60%)',
                    filter: 'blur(40px)',
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
                    scaleX: [1, 1.1, 0.95, 1.05, 1],
                    x: [-20, 20, -10, 30, -20],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute top-10 left-1/4 w-1/2 h-1/3"
                style={{
                    background: 'linear-gradient(180deg, rgba(200,100,255,0.1) 0%, rgba(100,255,200,0.08) 50%, transparent 100%)',
                    filter: 'blur(50px)',
                }}
                animate={{
                    opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
                    scaleX: [1, 0.9, 1.1, 0.95, 1],
                    x: [0, -30, 20, -10, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
        </div>
    );
};

// Vignette overlay component
const Vignette = () => (
    <div
        className="absolute inset-0 pointer-events-none"
        style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
    />
);

// Special 2026 text overlay
const NewYear2026Overlay = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
            className="text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400/20 via-amber-500/30 to-yellow-600/20 select-none"
            style={{
                WebkitTextStroke: '2px rgba(255,215,0,0.1)',
            }}
            animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.02, 1],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            2026
        </motion.div>
    </div>
);

const MountainBackground = () => {
    const { currentTheme } = useTheme();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Generate stable random positions for stars
    const starPositions = useMemo(() => {
        return [...Array(30)].map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 60,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
        }));
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Parallax spring config
    const springConfig = { damping: 25, stiffness: 120 };

    const xBack = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), springConfig);
    const yBack = useSpring(useTransform(mouseY, [-1, 1], [-5, 5]), springConfig);

    const xMid = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig);
    const yMid = useSpring(useTransform(mouseY, [-1, 1], [-10, 10]), springConfig);

    // Get theme colors - handle via being optional
    const skyVia = currentTheme.sky.via || currentTheme.sky.to;
    const skyGradient = `linear-gradient(to bottom, ${currentTheme.sky.from}, ${skyVia}, ${currentTheme.sky.to})`;
    const gradientId = `mainMountainGradient-${currentTheme.id}`;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Sky Gradient - now using theme config */}
            <motion.div
                className="absolute inset-0 transition-all duration-1000"
                style={{ background: skyGradient }}
                initial={false}
                animate={{ background: skyGradient }}
                transition={{ duration: 1 }}
            />

            {/* Theme-specific overlays */}
            {currentTheme.overlays?.gradient && currentTheme.overlays.gradient !== 'none' && (
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                    style={{ background: currentTheme.overlays.gradient }}
                />
            )}

            {/* Aurora for Winter Wonder */}
            {currentTheme.overlays?.aurora && <AuroraBorealis />}

            {/* New Year 2026 special text */}
            {currentTheme.specialText?.show && <NewYear2026Overlay />}

            {/* Ambient glow effects */}
            {currentTheme.glow && (
                <>
                    <div
                        className="absolute top-0 left-1/4 w-1/2 h-1/3 pointer-events-none blur-3xl transition-all duration-1000"
                        style={{ background: currentTheme.glow.primary }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-1/3 h-1/4 pointer-events-none blur-3xl transition-all duration-1000"
                        style={{ background: currentTheme.glow.secondary }}
                    />
                </>
            )}

            {/* Particle System - now canvas-based for performance */}
            <ParticleCanvas
                theme={currentTheme.particles.theme}
                intensity={currentTheme.particles.intensity}
            />

            {/* Static twinkling stars (only for dark themes) */}
            {!currentTheme.isLight && (
                <div className="absolute inset-0 opacity-60">
                    {starPositions.map((star, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-white rounded-full"
                            initial={{ opacity: 0.2, scale: 0.5 }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay
                            }}
                            style={{
                                left: `${star.left}%`,
                                top: `${star.top}%`,
                                width: star.size + 'px',
                                height: star.size + 'px',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Mountain SVG layers with parallax */}
            <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background Mountains (Far) */}
                <motion.path
                    d="M0 900L0 500C150 480 300 350 450 400C600 450 750 250 900 300C1050 350 1200 400 1440 350V900H0Z"
                    fill={currentTheme.mountains.back}
                    fillOpacity={currentTheme.mountains.backOpacity}
                    style={{ x: xBack, y: yBack }}
                />

                {/* Midground Mountains */}
                <motion.path
                    d="M-100 900L-100 600C100 580 300 450 500 550C700 650 900 400 1100 500C1300 600 1500 550 1600 900H-100Z"
                    fill={currentTheme.mountains.mid}
                    fillOpacity={currentTheme.mountains.midOpacity}
                    style={{ x: xMid, y: yMid }}
                />

                {/* Foreground Mountain (Main Climb) */}
                <path
                    d="M0 900L0 800C200 750 400 600 600 650C800 700 1000 200 1200 250C1350 287.5 1440 400 1440 900H0Z"
                    fill={`url(#${gradientId})`}
                />

                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="720"
                        y1="200"
                        x2="720"
                        y2="900"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor={currentTheme.mountains.front.start} />
                        <stop offset="100%" stopColor={currentTheme.mountains.front.end} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Vignette overlay */}
            {currentTheme.overlays?.vignette && <Vignette />}
        </div>
    );
};

export default MountainBackground;
