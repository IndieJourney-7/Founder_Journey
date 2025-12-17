import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MountainBackground from './MountainBackground';
import WindingPath from './WindingPath';
import StepMarker from './StepMarker';
import ClimberAvatar from './ClimberAvatar';
import StickyNote from './StickyNote';
import LessonModal from '../lessons/LessonModal';
import confetti from 'canvas-confetti';

const MountainDashboard = ({ steps = [], stickyNotes = [], progress = 0, onStepClick, onAddStickyNote, missionName, goalTarget, titleSize = "text-6xl md:text-7xl" }) => {
    // ... items ...

    // ... render return ...
    {/* Mission Name (Center Top) */ }
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-40 text-center pointer-events-none w-full px-4">
        <h1 className={`${titleSize} font-extrabold text-white mb-2 tracking-tight`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,1)' }}>
            {missionName || 'Your Ascent'}
        </h1>
        <div className="h-1.5 w-32 bg-brand-gold mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
    </div>
    // const [lessons, setLessons] = useState([]); // Removed local state
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentStepForLesson, setCurrentStepForLesson] = useState(null);
    const [avatarNudge, setAvatarNudge] = useState(0);

    // Path points for markers (Approximate positions along the bezier curve)
    // Path points for markers (Aligns with SVG ViewBox 0 0 1440 900)
    const markerPositions = [
        { x: '13.9%', y: '94.4%' },  // 200, 850
        { x: '27.8%', y: '83.3%' },  // 400, 750
        { x: '34.7%', y: '72.2%' },  // 500, 650
        { x: '38.2%', y: '61.1%' },  // 550, 550
        { x: '45.1%', y: '50.0%' },  // 650, 450
        { x: '62.5%', y: '50.0%' },  // 900, 450
        { x: '76.4%', y: '33.3%' },  // 1100, 300
        { x: '83.3%', y: '27.8%' },  // 1200, 250
    ];

    // Interpolate avatar position based on progress
    const getAvatarPosition = (prog) => {
        // Add nudge effect
        const effectiveProgress = Math.min(prog + avatarNudge, 100);

        // Sample points along the curve (Converted to % of 1440x900)
        const curvePoints = [
            { x: 13.8, y: 94.4 }, // 200, 850
            { x: 24.3, y: 88.8 }, // 350, 800
            { x: 31.2, y: 77.7 }, // 450, 700
            { x: 34.7, y: 72.2 }, // 500, 650
            { x: 36.4, y: 66.6 }, // 525, 600
            { x: 38.2, y: 61.1 }, // 550, 550
            { x: 41.6, y: 50.0 }, // 600, 450
            { x: 52.1, y: 46.6 }, // 750, 420
            { x: 62.5, y: 50.0 }, // 900, 450
            { x: 69.4, y: 44.4 }, // 1000, 400
            { x: 76.4, y: 33.3 }, // 1100, 300
            { x: 83.3, y: 27.7 }  // 1200, 250
        ];

        const totalPoints = curvePoints.length - 1;
        const currentPointIndex = Math.min(Math.floor((effectiveProgress / 100) * totalPoints), totalPoints - 1);
        const nextPointIndex = Math.min(currentPointIndex + 1, totalPoints);

        const segmentProgress = ((effectiveProgress / 100) * totalPoints) - currentPointIndex;

        const current = curvePoints[currentPointIndex];
        const next = curvePoints[nextPointIndex];

        const x = current.x + (next.x - current.x) * segmentProgress;
        const y = current.y + (next.y - current.y) * segmentProgress;

        return { x: `${x}%`, y: `${y}%` };
    };

    const avatarPos = getAvatarPosition(progress);

    // Handle step click to open lesson modal if status changed (simulated here, or explicit add)
    // For this demo, we'll open the modal when clicking a step, in addition to the parent's handler
    const handleStepClickInternal = (step) => {
        onStepClick(step);
        // If step is success or failed, prompt for lesson if none exists
        // For demo, we just open it to add a lesson
        setCurrentStepForLesson(step);
        setIsLessonModalOpen(true);
    };

    const handleSaveLesson = async (lessonData) => {
        if (onAddStickyNote) {
            await onAddStickyNote({
                step_id: currentStepForLesson.id,
                summary: lessonData.content,
                lesson_learned: lessonData.details,
                next_action: lessonData.next_action
            });
        }

        setIsLessonModalOpen(false);

        // Trigger Avatar Nudge & Celebration
        setAvatarNudge(2); // Jump up 2%
        setTimeout(() => setAvatarNudge(0), 2000); // Settle back

        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FFFFFF']
        });
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

            {/* Container to maintain aspect ratio - taller on mobile, wider on desktop */}
            <div className="relative w-full h-full max-w-[1440px] aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/11] lg:aspect-[16/10]">

                <MountainBackground />
                <WindingPath progress={progress} />

                {/* Steps */}
                {steps.map((step, index) => (
                    <StepMarker
                        key={step.id}
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                        position={markerPositions[index] || { x: '1200px', y: '250px' }}
                        onClick={handleStepClickInternal}
                    />
                ))}

                {/* Sticky Notes - Pamphlet style on journey path */}
                {stickyNotes.map((note) => {
                    const stepIndex = steps.findIndex(s => s.id === note.step_id);
                    if (stepIndex === -1) return null;
                    const step = steps[stepIndex];

                    return (
                        <StickyNote
                            key={note.id}
                            note={note}
                            step={step}
                            position={markerPositions[stepIndex] || markerPositions[markerPositions.length - 1]}
                            onClick={(clickedStep, clickedNote) => {
                                onStepClick(clickedStep);
                            }}
                        />
                    );
                })}

                {/* Avatar */}
                <motion.div
                    className="absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out"
                    style={{
                        left: avatarPos.x,
                        top: avatarPos.y,
                        transform: 'translate(-50%, -50%)' // Center the avatar on the point
                    }}
                >
                    <ClimberAvatar progress={progress + avatarNudge} />
                </motion.div>

                {/* Summit Goal & Target */}
                <div className="absolute right-[10%] top-[15%] flex flex-col items-center z-20 transform translate-x-1/2">
                    {/* Target Goal (Above Flag) */}
                    <div className="bg-brand-gold text-brand-blue font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg border-2 border-white/20 mb-1 sm:mb-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-lg animate-bounce">
                        {goalTarget || 'Goal'}
                    </div>

                    <motion.div
                        className="text-4xl sm:text-5xl md:text-6xl filter drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🚩
                    </motion.div>
                </div>

                {/* Mission Name (Center Top) */}
                <div className="absolute top-6 sm:top-10 left-1/2 transform -translate-x-1/2 z-40 text-center pointer-events-none w-full px-4">
                    <h1 className={`${titleSize} font-extrabold text-white mb-2 tracking-tight`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,1)' }}>
                        {missionName || 'Your Ascent'}
                    </h1>
                    <div className="h-1 sm:h-1.5 w-20 sm:w-32 bg-brand-gold mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
                </div>

                {/* Lesson Modal */}
                <LessonModal
                    isOpen={isLessonModalOpen}
                    onClose={() => setIsLessonModalOpen(false)}
                    onSave={handleSaveLesson}
                    stepTitle={currentStepForLesson?.title}
                    initialData={stickyNotes.find(l => l.step_id === currentStepForLesson?.id) || {}}
                />

            </div>
        </div>
    );
};

export default MountainDashboard;
