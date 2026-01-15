import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MountainBackground from './MountainBackground';
import WindingPath from './WindingPath';
import StepMarker from './StepMarker';
import ClimberAvatar from './ClimberAvatar';
import StickyNote from './StickyNote';
import StepDetailModal from './StepDetailModal';
import LessonModal from '../lessons/LessonModal';
import MilestoneMarker from './MilestoneMarker';
import MilestoneDetailModal from '../MilestoneDetailModal';
import confetti from 'canvas-confetti';
import { getMilestonePosition, getMilestonePositionByIndex } from '../../utils/pathUtils';

const MountainDashboard = ({
    steps = [],
    stickyNotes = [],
    progress = 0,
    onStepClick,
    onAddStickyNote,
    onRefreshNotes,
    missionName,
    goalTarget,
    titleSize = "text-6xl md:text-7xl",
    // Metric tracking props
    hasMetricProgress = false,
    currentValue = 0,
    targetValue = 0,
    metricPrefix = '',
    metricSuffix = '',
    // Milestone props (new)
    milestones = [],
    currentMilestone = null,
    showMilestones = true // Toggle between steps view and milestones view
}) => {
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentStepForLesson, setCurrentStepForLesson] = useState(null);
    const [avatarNudge, setAvatarNudge] = useState(0);

    // State for StepDetailModal
    const [selectedStep, setSelectedStep] = useState(null);
    const [stepModalOpen, setStepModalOpen] = useState(false);

    // State for MilestoneDetailModal
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);

    // Format value with prefix/suffix for milestones
    const formatValue = (value) => {
        if (value === null || value === undefined) return '0';
        const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
        return `${metricPrefix}${formatted}${metricSuffix ? ' ' + metricSuffix : ''}`;
    };

    // Handle milestone click
    const handleMilestoneClick = (milestone) => {
        setSelectedMilestone(milestone);
        setMilestoneModalOpen(true);
    };

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

                {/* Milestone Markers (Lock-based journey) */}
                {showMilestones && milestones.length > 0 && milestones.map((milestone, index) => {
                    // Calculate position based on target value or index
                    const position = hasMetricProgress && targetValue > 0
                        ? getMilestonePosition(milestone, targetValue)
                        : getMilestonePositionByIndex(index, milestones.length);

                    return (
                        <MilestoneMarker
                            key={milestone.id}
                            milestone={milestone}
                            position={position}
                            isActive={currentMilestone?.id === milestone.id}
                            onClick={handleMilestoneClick}
                            formatValue={formatValue}
                        />
                    );
                })}

                {/* Legacy Steps (shown when no milestones or showMilestones is false) */}
                {(!showMilestones || milestones.length === 0) && steps.map((step, index) => (
                    <StepMarker
                        key={step.id}
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                        position={markerPositions[index] || { x: '1200px', y: '250px' }}
                        onClick={handleStepClickInternal}
                    />
                ))}

                {/* Sticky Notes - Pamphlet style on journey path (grouped by step) */}
                {(!showMilestones || milestones.length === 0) && steps.map((step, stepIndex) => {
                    // Group all lessons for this step
                    const lessonsForStep = stickyNotes.filter(note => note.step_id === step.id);
                    if (lessonsForStep.length === 0) return null;

                    return (
                        <StickyNote
                            key={step.id}
                            lessons={lessonsForStep}
                            step={step}
                            position={markerPositions[stepIndex] || markerPositions[markerPositions.length - 1]}
                            onClick={(clickedStep, clickedLessons) => {
                                setSelectedStep(clickedStep);
                                setStepModalOpen(true);
                            }}
                        />
                    );
                })}

                {/* Avatar with Metric Badge */}
                <motion.div
                    className="absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out"
                    style={{
                        left: avatarPos.x,
                        top: avatarPos.y,
                        transform: 'translate(-50%, -50%)' // Center the avatar on the point
                    }}
                >
                    <ClimberAvatar progress={progress + avatarNudge} />
                    {/* Current Metric Value Badge (shows near climber when metric tracking is active) */}
                    {hasMetricProgress && currentValue > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                        >
                            <div className="bg-brand-teal text-white font-bold px-2 py-1 rounded-full text-xs shadow-lg border border-white/30">
                                {metricPrefix}{currentValue >= 1000 ? `${(currentValue/1000).toFixed(1)}K` : currentValue.toLocaleString()}{metricSuffix ? ` ${metricSuffix}` : ''}
                            </div>
                        </motion.div>
                    )}
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

                {/* Step Detail Modal - Manage all lessons for a step */}
                <StepDetailModal
                    step={selectedStep}
                    isOpen={stepModalOpen}
                    onClose={() => setStepModalOpen(false)}
                    onUpdate={() => {
                        // Trigger parent to reload all notes from database
                        if (onRefreshNotes) {
                            onRefreshNotes();
                        }
                    }}
                />

                {/* Milestone Detail Modal - Promise card with calendar */}
                <MilestoneDetailModal
                    isOpen={milestoneModalOpen}
                    onClose={() => setMilestoneModalOpen(false)}
                    milestone={selectedMilestone}
                />

            </div>
        </div>
    );
};

export default MountainDashboard;
