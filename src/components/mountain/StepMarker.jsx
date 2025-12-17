import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';

const StepMarker = ({ step, index, totalSteps, position, onClick }) => {
    const { status, title } = step;

    // Status colors and effects
    const getStatusStyles = () => {
        switch (status) {
            case 'success':
                return {
                    bg: 'bg-emerald-500',
                    border: 'border-emerald-300',
                    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]',
                    icon: <Check size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                };
            case 'failed':
                return {
                    bg: 'bg-red-500',
                    border: 'border-red-300',
                    shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
                    icon: <span className="text-white font-bold text-[10px] sm:text-xs">!</span>
                };
            case 'in-progress':
                return {
                    bg: 'bg-amber-400',
                    border: 'border-yellow-200',
                    shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.6)]',
                    icon: <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                };
            default: // pending
                return {
                    bg: 'bg-slate-700',
                    border: 'border-slate-500',
                    shadow: 'shadow-none',
                    icon: <Lock size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            style={{ left: position.x, top: position.y }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onClick(step)}
        >
            {/* Marker Circle - Smaller on mobile */}
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${styles.bg} border-2 ${styles.border} ${styles.shadow} flex items-center justify-center transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-200">
                    {styles.icon}
                </div>
                {/* Hover Icon (Plus/Edit) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                    <span className="font-bold text-lg">+</span>
                </div>

                {/* Success Sparkles */}
                {status === 'success' && (
                    <motion.div
                        className="absolute -top-1 -right-1 text-yellow-300 pointer-events-none"
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Sparkles size={8} className="sm:w-2.5 sm:h-2.5" fill="currentColor" />
                    </motion.div>
                )}
            </div>

            {/* Tooltip Card - Hidden on mobile to avoid clutter */}
            <div className="hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none min-w-[120px] sm:min-w-[140px] z-30">
                <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-1.5 sm:p-2 text-center shadow-xl">
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">Step {index + 1}</p>
                    <p className="text-xs sm:text-sm text-white font-medium whitespace-nowrap mb-0.5 sm:mb-1">{title}</p>
                    <p className="text-[8px] sm:text-[10px] text-brand-gold font-bold uppercase tracking-wider">Click to Add Note</p>
                </div>
                {/* Arrow */}
                <div className="w-0 h-0 border-l-[5px] sm:border-l-[6px] border-l-transparent border-r-[5px] sm:border-r-[6px] border-r-transparent border-t-[5px] sm:border-t-[6px] border-t-slate-600 absolute left-1/2 transform -translate-x-1/2 top-full" />
            </div>
        </motion.div>
    );
};

export default StepMarker;
