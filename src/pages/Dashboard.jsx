import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Plus, X, Share2, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMountain } from '../context/MountainContext'
import { usePlanLimits } from '../hooks/usePlanLimits'
import MountainDashboard from '../components/mountain/MountainDashboard'
import StepCard from '../components/StepCard'
import BannerExportModal from '../components/sharing/BannerExportModal'
import MinimalBannerExport from '../components/sharing/MinimalBannerExport'
import ReflectionModal from '../components/ReflectionModal'
import NoteViewer from '../components/NoteViewer'
import FeedbackModal from '../components/FeedbackModal'
import SignupPromptModal from '../components/SignupPromptModal'

export default function Dashboard() {
    const { user } = useAuth()
    const {
        currentMountain,
        steps: contextSteps,
        journeyNotes,
        addStep,
        updateStepStatus,
        saveJourneyNote,
        deleteNoteAndResetStep,
        deleteStep,
        editStep,
        progress,
        resolvedSteps,
        totalPlanned,
        refresh,
        isDemoMode
    } = useMountain()
    const { checkLimit, isPro } = usePlanLimits()

    // Data
    const steps = contextSteps || []
    const goal = currentMountain ? { goal_amount: currentMountain.target } : { goal_amount: '' }
    const missionName = currentMountain ? currentMountain.title : ''
    const theme = 'startup'

    // UI State
    const [isAddingStep, setIsAddingStep] = useState(false)
    const [editingStep, setEditingStep] = useState(null) // New state for editing
    const [newStep, setNewStep] = useState({ title: '', description: '', expected_outcome: '' })
    const [isExportOpen, setIsExportOpen] = useState(false)
    const [isMinimalExportOpen, setIsMinimalExportOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [showSignupPrompt, setShowSignupPrompt] = useState(false)
    const [signupPromptType, setSignupPromptType] = useState('stepLimit')
    const mountainRef = useRef(null)

    // Reflection Modal State
    const [reflectionModal, setReflectionModal] = useState({
        isOpen: false,
        step: null,
        result: null,
        editingNote: null
    })

    // Note Viewer State
    const [noteViewer, setNoteViewer] = useState({
        isOpen: false,
        step: null,
        note: null
    })

    // Get note for a step
    const getNoteForStep = (stepId) => {
        return journeyNotes.find(n => n.step_id === stepId)
    }

    // Celebration trigger
    useEffect(() => {
        if (progress > 0 && progress % 25 === 0 && progress <= 100) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E7C778', '#1CC5A3', '#FFFFFF']
            })
        }
    }, [progress])

    // Check if the latest step is resolved (has status + note)
    const checkPreviousStepResolved = () => {
        if (steps.length === 0) return true

        const lastStep = [...steps].sort((a, b) => a.order_index - b.order_index).pop()

        // Check if resolved (success/failed)
        if (lastStep.status !== 'success' && lastStep.status !== 'failed') {
            return false
        }

        // Check if note exists
        const note = getNoteForStep(lastStep.id)
        if (!note) {
            return false
        }

        return true
    }

    // Add new step
    const handleAddStep = async (e) => {
        e.preventDefault()
        if (!newStep.title) return

        // Check limits if adding new step (not editing)
        if (!editingStep && !checkLimit('add_step')) {
            alert("You've reached the step limit for the Free plan. Upgrade to Pro!")
            return
        }

        // Integrity Check: Previous step must be resolved (only if adding new)
        if (!editingStep && !checkPreviousStepResolved()) {
            alert("Reflect on the previous step before continuing your journey.")
            return
        }

        // Add or edit step
        if (editingStep) {
            // Edit mode
            await editStep(editingStep.id, {
                title: newStep.title,
                description: newStep.description,
                expected_outcome: newStep.expected_outcome
            })
        } else {
            // Add mode
            const result = await addStep({
                title: newStep.title,
                description: newStep.description,
                expected_outcome: newStep.expected_outcome,
                status: 'pending'
            })

            // Check if demo mode hit step limit
            if (result && result.limitReached) {
                setSignupPromptType('stepLimit')
                setShowSignupPrompt(true)
                return
            }
        }

        setIsAddingStep(false)
        setEditingStep(null)
        setNewStep({ title: '', description: '', expected_outcome: '' })
    }

    // Open reflection modal when clicking Success/Fail
    const handleStepAction = (stepId, result) => {
        // DEMO MODE: Allow adding notes locally
        const step = steps.find(s => s.id === stepId)
        setReflectionModal({
            isOpen: true,
            step: step,
            result: result,
            editingNote: null
        })
    }

    // Save reflection and update step status
    const handleReflectionSave = async (noteData) => {
        const { step, result, editingNote } = reflectionModal

        // Save the journey note
        await saveJourneyNote(step.id, noteData, result)

        // Only update step status if not editing an existing note
        if (!editingNote) {
            await updateStepStatus(step.id, result)
        }

        setReflectionModal({ isOpen: false, step: null, result: null, editingNote: null })
    }

    // Open note viewer
    const handleViewNote = (step, note) => {
        setNoteViewer({ isOpen: true, step, note })
    }

    // Edit note from viewer
    const handleEditNote = (step, note) => {
        setReflectionModal({
            isOpen: true,
            step: step,
            result: note.result,
            editingNote: note
        })
    }

    // Delete note and reset step
    const handleDeleteNote = async (stepId, noteId) => {
        await deleteNoteAndResetStep(stepId, noteId)
    }

    const handleDeleteStep = async (stepId) => {
        if (window.confirm('Are you sure you want to delete this step? This cannot be undone.')) {
            await deleteStep(stepId)
        }
    }

    const handleEditStepClick = (step) => {
        setEditingStep(step)
        setNewStep({
            title: step.title,
            description: step.description || '',
            expected_outcome: step.expected_outcome || ''
        })
        setIsAddingStep(true)
    }

    const handleExportClick = () => {
        if (!checkLimit('export')) {
            alert("Upgrade to Pro to create custom banners for social media!")
            return
        }
        setIsMinimalExportOpen(true)
    }

    return (
        <div className="flex-1 flex flex-col relative">
            {/* Demo Mode Banner */}
            {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-gold/20 to-yellow-500/20 text-brand-gold px-4 py-3 text-center text-sm font-medium z-50 border-b border-brand-gold/40 backdrop-blur-sm">
                    <span className="mr-2">🎨</span>
                    <span className="font-bold">Demo Mode</span>
                    <span className="mx-2 text-white/40">•</span>
                    <span className="text-white/80">Your data is saved locally</span>
                    <span className="mx-2 text-white/40">•</span>
                    <a href="/auth?mode=signup&from=demo" className="underline hover:text-white transition-colors font-semibold">
                        Sign up free to save permanently
                    </a>
                </div>
            )}

            {/* Header Actions */}
            <div className={`absolute ${isDemoMode ? 'top-16' : 'top-4'} right-2 sm:right-4 z-40 flex flex-col sm:flex-row gap-2`}>
                {!isPro && (
                    <Link to="/pricing" className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-brand-gold to-yellow-500 rounded-lg text-brand-blue font-bold hover:shadow-lg transition-all text-xs sm:text-sm whitespace-nowrap">
                        Upgrade
                    </Link>
                )}
                <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
                    title="Give Feedback"
                >
                    <MessageSquare size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                    onClick={handleExportClick}
                    className={`p-2 backdrop-blur-md rounded-full transition-colors border ${!isPro ? 'bg-black/10 text-white/30 border-white/5 cursor-not-allowed' : 'bg-black/30 text-white hover:bg-white/10 border-white/10'}`}
                    title={!isPro ? "Upgrade to Pro to create banners" : "Create Progress Banner"}
                >
                    <Share2 size={18} className="sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Progress Display */}
            <div className={`absolute ${isDemoMode ? 'top-16' : 'top-4'} left-2 sm:left-4 z-40`}>
                <div className="bg-black/30 backdrop-blur-md rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-white/60">Progress</div>
                    <div className="text-xl sm:text-2xl font-bold text-brand-gold">{Math.round(progress)}%</div>
                    <div className="text-[10px] sm:text-xs text-white/40">
                        {resolvedSteps}/{totalPlanned} done
                    </div>
                </div>
            </div>

            {/* Mountain View - Give more space on mobile */}
            <div className="flex-1 min-h-[500px] sm:min-h-[600px] bg-gradient-to-b from-[#0a1529] to-brand-blue relative overflow-hidden" ref={mountainRef}>
                <MountainDashboard
                    steps={steps}
                    stickyNotes={journeyNotes}
                    progress={progress}
                    theme={theme}
                    missionName={missionName}
                    goalTarget={goal.goal_amount}
                    onStepClick={(step) => {
                        const note = getNoteForStep(step.id)
                        if (note) handleViewNote(step, note)
                    }}
                    onAddStickyNote={async (notePayload) => {
                        // Adapter: MountainDashboard's LessonModal -> Dashboard's saveJourneyNote
                        // Payload: { step_id, summary (content), lesson_learned (details), ... }
                        // Dashboard Expects: (stepId, { reflection_text, lesson_learned }, result)

                        // We assume 'success' if added via this modal for now, or we need to know result.
                        // LessonModal is generic. Let's assume Success for "Lessons Learned".

                        await saveJourneyNote(notePayload.step_id, {
                            reflection_text: notePayload.lesson_learned || notePayload.summary, // Details
                            lesson_learned: notePayload.summary // Headline
                        }, 'success')

                        // Refresh/Update status handled by context usually
                        await updateStepStatus(notePayload.step_id, 'success')
                    }}
                    onRefreshNotes={refresh}
                />
            </div>

            {/* Steps Panel */}
            <div className="h-1/3 min-h-[250px] bg-brand-blue border-t border-white/10 p-3 sm:p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold">Your Strategies</h3>
                            <p className="text-xs sm:text-sm text-white/50">{steps.length} steps added</p>
                        </div>
                        <button
                            onClick={() => {
                                if (!checkLimit('add_step')) {
                                    alert("You've reached the step limit for the Free plan (6/6). Upgrade to Summit Pro to add unlimited steps!")
                                    return
                                }
                                setEditingStep(null);
                                setNewStep({ title: '', description: '', expected_outcome: '' });
                                setIsAddingStep(true);
                            }}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors text-sm ${!checkLimit('add_step')
                                ? 'bg-white/10 text-white/50 cursor-not-allowed hover:bg-white/10'
                                : 'bg-brand-teal text-brand-blue hover:bg-teal-400'
                                }`}
                        >
                            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                            {!checkLimit('add_step') ? 'Limit Reached' : 'Add Step'}
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {steps.length === 0 ? (
                            <div className="col-span-3 text-center py-10 text-white/50 border-2 border-dashed border-white/10 rounded-xl">
                                <p className="mb-2">Your mountain is waiting.</p>
                                <button
                                    onClick={() => {
                                        setEditingStep(null);
                                        setNewStep({ title: '', description: '', expected_outcome: '' });
                                        setIsAddingStep(true);
                                    }}
                                    className="text-brand-gold hover:underline font-bold"
                                >
                                    Add your first strategy step
                                </button>
                            </div>
                        ) : (
                            steps.map(step => (
                                <StepCard
                                    key={step.id}
                                    step={step}
                                    note={getNoteForStep(step.id)}
                                    onUpdateStatus={handleStepAction}
                                    onViewNote={handleViewNote}
                                    onDelete={handleDeleteStep}
                                    onEdit={handleEditStepClick}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add Step Modal */}
            <AnimatePresence>
                {isAddingStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">{editingStep ? 'Edit Strategy' : 'New Strategy'}</h3>
                                <button onClick={() => setIsAddingStep(false)} className="text-white/50 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddStep} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/80">Strategy Title</label>
                                    <input
                                        value={newStep.title}
                                        onChange={e => setNewStep({ ...newStep, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none"
                                        placeholder="e.g. Launch on Product Hunt"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/80">Why try this?</label>
                                    <textarea
                                        value={newStep.description}
                                        onChange={e => setNewStep({ ...newStep, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none h-24 resize-none"
                                        placeholder="Hypothesis..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white/80">Expected Outcome</label>
                                    <input
                                        value={newStep.expected_outcome}
                                        onChange={e => setNewStep({ ...newStep, expected_outcome: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none"
                                        placeholder="e.g. 500 signups"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg bg-brand-gold text-brand-blue font-bold hover:bg-yellow-400 transition-colors mt-4"
                                >
                                    {editingStep ? 'Update Strategy' : 'Add to Mountain'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reflection Modal */}
            <ReflectionModal
                isOpen={reflectionModal.isOpen}
                onClose={() => setReflectionModal({ isOpen: false, step: null, result: null, editingNote: null })}
                onSave={handleReflectionSave}
                stepTitle={reflectionModal.step?.title || ''}
                result={reflectionModal.result}
                initialData={reflectionModal.editingNote}
            />

            {/* Note Viewer */}
            <NoteViewer
                isOpen={noteViewer.isOpen}
                onClose={() => setNoteViewer({ isOpen: false, step: null, note: null })}
                step={noteViewer.step}
                note={noteViewer.note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
            />

            {/* Minimal Banner Export Modal */}
            <MinimalBannerExport
                isOpen={isMinimalExportOpen}
                onClose={() => setIsMinimalExportOpen(false)}
            />

            {/* Banner Export Modal (Original) */}
            <BannerExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                mountainRef={mountainRef}
            />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Signup Prompt Modal */}
            <SignupPromptModal
                isOpen={showSignupPrompt}
                onClose={() => setShowSignupPrompt(false)}
                promptType={signupPromptType}
            />
        </div>
    )
}
