import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, BookOpen } from 'lucide-react';

/**
 * StickyNote - Pamphlet style note displayed on journey path
 * Shows lessons count and latest lesson from a step
 * Now supports MULTIPLE lessons per step
 */
const StickyNote = ({ lessons = [], step, position, onClick }) => {
    if (!lessons || lessons.length === 0 || !step) return null;

    // Get latest lesson to display
    const latestLesson = lessons[lessons.length - 1];
    const lessonCount = lessons.length;

    // Determine overall success (if any lesson is success, show green)
    const hasSuccess = lessons.some(l => l.result === 'success');
    const isSuccess = hasSuccess;

    // Lesson content to display (from latest lesson)
    const lessonText = latestLesson.title || latestLesson.lesson_learned || latestLesson.reflection_text || 'No lesson recorded';

    return (
        <motion.div
            className="absolute z-25 cursor-pointer"
            style={{
                left: `calc(${position.x} + 3vw)`,
                top: `calc(${position.y} - 2vh)`
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
            onClick={() => onClick(step, lessons)}
        >
            {/* Paper/Pamphlet Container */}
            <div className={`
                relative w-28 sm:w-36 md:w-40 
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
                <div className="absolute -top-1 sm:-top-1.5 left-3 sm:left-4 w-2 h-2 sm:w-3 sm:h-3">
                    <div className={`w-full h-full rounded-full shadow-md ${isSuccess ? 'bg-brand-teal' : 'bg-red-500'}`} />
                </div>

                {/* Content */}
                <div className="p-2 sm:p-3 pt-3 sm:pt-4">
                    {/* Status Icon */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                        {isSuccess ? (
                            <CheckCircle size={10} className="sm:w-3 sm:h-3 text-brand-teal" />
                        ) : (
                            <XCircle size={10} className="sm:w-3 sm:h-3 text-red-500" />
                        )}
                        <span className={`text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide ${isSuccess ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isSuccess ? 'Win' : 'Lesson'}
                        </span>
                    </div>

                    {/* Step Title */}
                    <p className={`text-[8px] sm:text-[10px] font-bold mb-1 sm:mb-1.5 line-clamp-1 ${isSuccess ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {step.title}
                    </p>

                    {/* Lesson Content - Main focus */}
                    <div className={`
                        p-1.5 sm:p-2 rounded
                        ${isSuccess ? 'bg-emerald-200/40' : 'bg-amber-200/40'}
                    `}>
                        <div className="flex items-start gap-0.5 sm:gap-1">
                            <Lightbulb size={8} className={`sm:w-2.5 sm:h-2.5 mt-0.5 flex-shrink-0 ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <p className={`text-[7px] sm:text-[9px] leading-tight line-clamp-2 font-medium ${isSuccess ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {lessonText}
                            </p>
                        </div>
                    </div>

                    {/* Lesson Count Badge (if multiple) */}
                    {lessonCount > 1 && (
                        <div className="flex items-center justify-center gap-0.5 mt-1.5">
                            <BookOpen size={8} className={`sm:w-2.5 sm:h-2.5 ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span className={`text-[7px] sm:text-[8px] font-bold ${isSuccess ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {lessonCount} lessons →
                            </span>
                        </div>
                    )}
                </div>

                {/* Corner fold effect - paper look */}
                <div className={`
                    absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4
                    ${isSuccess ? 'bg-emerald-200' : 'bg-amber-200'}
                `} style={{
                        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                    }} />

                {/* Shadow under fold */}
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-black/5" style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                    transform: 'translate(-2px, -2px)'
                }} />
            </div>
        </motion.div>
    );
};

export default StickyNote;
