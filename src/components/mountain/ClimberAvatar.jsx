import React from 'react';
import { motion } from 'framer-motion';

const ClimberAvatar = ({ progress, pathRef }) => {
    // In a real implementation with full SVG path support, we'd use useTransform on the path length.
    // For now, we'll use a simplified position calculation or assume the parent passes coordinates.
    // However, to make it truly follow the curve, we can use offset-path in CSS if supported, 
    // or just interpolate manually.

    // Let's assume the parent component calculates the (x,y) based on progress for the avatar 
    // to ensure it stays exactly on the line.
    // BUT, to be self-contained and smooth, let's use a motion value if possible.

    return (
        <motion.div
            className="absolute z-30 pointer-events-none"
            style={{
                // These will be overridden by the parent's motion values or passed props
                // For now, we'll rely on the parent to position this container
            }}
        >
            <div className="relative">
                {/* Avatar Circle */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-white shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center justify-center text-xl relative z-10">
                    🧗
                </div>

                {/* Pulse Effect */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400 -z-10"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Progress Badge */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/80 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-500/30 whitespace-nowrap">
                    {Math.round(progress)}%
                </div>

                {/* Motivational Tooltip (Always visible or on hover? Let's make it appear occasionally) */}
                <motion.div
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
                >
                    Keep climbing! 🚀
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ClimberAvatar;
