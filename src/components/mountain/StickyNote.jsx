import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

/**
 * StickyNote - Pamphlet style note displayed on journey path
 * Shows the lesson learned from each step
 */
const StickyNote = ({ note, step, position, onClick }) => {
    if (!note || !step) return null;

    const isSuccess = note.result === 'success';

    // Lesson content to display
    const lessonText = note.lesson_learned || note.reflection_text || note.notes || 'No lesson recorded';

    return (
        <motion.div
            className="absolute z-25 cursor-pointer"
            style={{
                left: `calc(${position.x} + 50px)`,
                top: `calc(${position.y} - 30px)`
            }}
            initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: Math.random() * 4 - 2 // Slight random tilt
            }}
            whileHover={{
                scale: 1.15,
                rotate: 0,
                zIndex: 60,
                transition: { duration: 0.2 }
            }}
            onClick={() => onClick(step, note)}
        >
            {/* Paper/Pamphlet Container */}
            <div className={`
                relative w-40 
                ${isSuccess ? 'bg-gradient-to-b from-emerald-50 to-emerald-100' : 'bg-gradient-to-b from-amber-50 to-amber-100'}
                rounded-sm shadow-lg 
                border-l-4 ${isSuccess ? 'border-l-brand-teal' : 'border-l-red-400'}
                overflow-hidden
                transform origin-top-left
            `}>
                {/* Top fold effect - makes it look like paper */}
                <div className={`
                    absolute top-0 left-0 right-0 h-1.5
                    ${isSuccess ? 'bg-emerald-200/50' : 'bg-amber-200/50'}
                `} />

                {/* Pin/Tack */}
                <div className="absolute -top-1.5 left-4 w-3 h-3">
                    <div className={`w-full h-full rounded-full shadow-md ${isSuccess ? 'bg-brand-teal' : 'bg-red-500'}`} />
                </div>

                {/* Content */}
                <div className="p-3 pt-4">
                    {/* Status Icon */}
                    <div className="flex items-center gap-1.5 mb-2">
                        {isSuccess ? (
                            <CheckCircle size={12} className="text-brand-teal" />
                        ) : (
                            <XCircle size={12} className="text-red-500" />
                        )}
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSuccess ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isSuccess ? 'Win' : 'Lesson'}
                        </span>
                    </div>

                    {/* Step Title */}
                    <p className={`text-[10px] font-bold mb-1.5 line-clamp-1 ${isSuccess ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {step.title}
                    </p>

                    {/* Lesson Content - Main focus */}
                    <div className={`
                        p-2 rounded 
                        ${isSuccess ? 'bg-emerald-200/40' : 'bg-amber-200/40'}
                    `}>
                        <div className="flex items-start gap-1">
                            <Lightbulb size={10} className={`mt-0.5 flex-shrink-0 ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <p className={`text-[9px] leading-tight line-clamp-3 font-medium ${isSuccess ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {lessonText}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Corner fold effect - paper look */}
                <div className={`
                    absolute bottom-0 right-0 w-4 h-4
                    ${isSuccess ? 'bg-emerald-200' : 'bg-amber-200'}
                `} style={{
                        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                    }} />

                {/* Shadow under fold */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-black/5" style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                    transform: 'translate(-2px, -2px)'
                }} />
            </div>
        </motion.div>
    );
};

export default StickyNote;
