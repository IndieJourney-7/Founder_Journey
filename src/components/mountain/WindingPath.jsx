import React from 'react';
import { motion } from 'framer-motion';

const WindingPath = ({ progress = 0 }) => {
    // The path definition - needs to align with the mountain shape in MountainBackground
    // Starting from bottom left, winding up to the peak at roughly (1200, 250)
    const pathD = "M200 850 C 350 850, 450 750, 500 650 C 550 550, 450 500, 600 450 C 750 400, 900 500, 1000 400 C 1100 300, 1150 280, 1200 250";

    return (
        <svg
            className="absolute bottom-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Base Path (Dotted/Faded) */}
            <path
                d={pathD}
                stroke="rgba(231, 199, 120, 0.3)"
                strokeWidth="4"
                strokeDasharray="10 10"
                strokeLinecap="round"
                fill="none"
            />

            {/* Progress Path (Solid/Glowing) */}
            <motion.path
                d={pathD}
                stroke="#E7C778"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(231, 199, 120, 0.6))" }}
            />
        </svg>
    );
};

export default WindingPath;
