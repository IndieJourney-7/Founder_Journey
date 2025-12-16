import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// Theme configuration
const THEMES = {
    startup: {
        sky: 'from-[#4E6ED0] to-[#0F1F3D]',
        back: '#1a3a6e',
        mid: '#152c5b',
        front: { start: '#2A4A8A', end: '#0F1F3D' }
    },
    fitness: {
        sky: 'from-[#D04E4E] to-[#2D0F0F]',
        back: '#6e1a1a',
        mid: '#5b1515',
        front: { start: '#8A2A2A', end: '#2D0F0F' }
    },
    study: {
        sky: 'from-[#4ED0A8] to-[#0F2D25]',
        back: '#1a6e58',
        mid: '#155b48',
        front: { start: '#2A8A70', end: '#0F2D25' }
    },
    wealth: {
        sky: 'from-[#D0B84E] to-[#1A1A0F]',
        back: '#6e621a',
        mid: '#5b5115',
        front: { start: '#8A7A2A', end: '#1A1A0F' }
    }
};

const MountainBackground = ({ theme = 'startup' }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const currentTheme = THEMES[theme] || THEMES.startup;

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Parallax spring config
    const springConfig = { damping: 25, stiffness: 120 };

    const xBack = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), springConfig);
    const yBack = useSpring(useTransform(mouseY, [-1, 1], [-5, 5]), springConfig);

    const xMid = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig);
    const yMid = useSpring(useTransform(mouseY, [-1, 1], [-10, 10]), springConfig);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Sky Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.sky}`} />

            {/* Stars */}
            <div className="absolute inset-0 opacity-60">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        initial={{ opacity: 0.2, scale: 0.5 }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 60}%`,
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                        }}
                    />
                ))}
            </div>

            <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMax slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background Mountains (Far) */}
                <motion.path
                    d="M0 900L0 500C150 480 300 350 450 400C600 450 750 250 900 300C1050 350 1200 400 1440 350V900H0Z"
                    fill={currentTheme.back}
                    fillOpacity="0.4"
                    style={{ x: xBack, y: yBack }}
                />

                {/* Midground Mountains */}
                <motion.path
                    d="M-100 900L-100 600C100 580 300 450 500 550C700 650 900 400 1100 500C1300 600 1500 550 1600 900H-100Z"
                    fill={currentTheme.mid}
                    fillOpacity="0.7"
                    style={{ x: xMid, y: yMid }}
                />

                {/* Foreground Mountain (Main Climb) */}
                <path
                    d="M0 900L0 800C200 750 400 600 600 650C800 700 1000 200 1200 250C1350 287.5 1440 400 1440 900H0Z"
                    fill="url(#mainMountainGradient)"
                />

                <defs>
                    <linearGradient id="mainMountainGradient" x1="720" y1="200" x2="720" y2="900" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={currentTheme.front.start} />
                        <stop offset="100%" stopColor={currentTheme.front.end} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default MountainBackground;
