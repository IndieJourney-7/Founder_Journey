import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useMountain } from '../context/MountainContext'
import { ArrowLeft, CheckCircle, XCircle, Calendar, MapPin, Lightbulb, BookOpen, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import LessonCardExport from '../components/sharing/LessonCardExport'

export default function Lessons() {
    const { journeyNotes, steps } = useMountain()
    const navigate = useNavigate()
    const [filter, setFilter] = useState('all') // all, success, failure
    const [expandedSteps, setExpandedSteps] = useState({}) // Track which steps are expanded
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [selectedStepTitle, setSelectedStepTitle] = useState('')

    // Group lessons by step
    const stepGroups = steps
        .map(step => {
            const lessonsForStep = journeyNotes
                .filter(note => note.step_id === step.id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

            return {
                step,
                lessons: lessonsForStep,
                hasSuccess: lessonsForStep.some(l => l.result === 'success'),
                hasFailure: lessonsForStep.some(l => l.result === 'failure' || l.result === 'failed')
            }
        })
        .filter(group => {
            // Only show steps with lessons
            if (group.lessons.length === 0) return false

            // Apply filter
            if (filter === 'all') return true
            if (filter === 'success') return group.hasSuccess
            if (filter === 'failure') return group.hasFailure
            return true
        })
        .sort((a, b) => a.step.order_index - b.step.order_index)

    const toggleStep = (stepId) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }))
    }

    const handleViewInJourney = (stepId) => {
        navigate('/dashboard')
    }

    const handleShare = (lesson, stepTitle) => {
        setSelectedLesson(lesson)
        setSelectedStepTitle(stepTitle)
        setShareModalOpen(true)
    }

    return (
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={16} /> Back to Mountain
                    </Link>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <BookOpen className="text-brand-gold" size={32} />
                        Lessons Trail
                    </h1>
                    <p className="text-white/60 mt-2 max-w-2xl">
                        A gallery of your wisdom. Each step on your journey, whether a success or a stumble, has left a mark here.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                        All ({stepGroups.length})
                    </FilterButton>
                    <FilterButton active={filter === 'success'} onClick={() => setFilter('success')}>
                        Wins
                    </FilterButton>
                    <FilterButton active={filter === 'failure'} onClick={() => setFilter('failure')}>
                        Learnings
                    </FilterButton>
                </div>
            </div>

            {/* Step Groups */}
            {stepGroups.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <div className="text-6xl mb-4">🏔️</div>
                    <h3 className="text-xl font-bold mb-2">The trail is empty yet</h3>
                    <p className="text-white/50 mb-6">Complete steps on your mountain to leave markers on this trail.</p>
                    <Link to="/dashboard" className="px-6 py-3 bg-brand-teal text-brand-blue font-bold rounded-lg hover:bg-teal-400 transition-colors">
                        Go to Mountain
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {stepGroups.map(group => (
                        <StepGroupCard
                            key={group.step.id}
                            group={group}
                            isExpanded={expandedSteps[group.step.id]}
                            onToggle={() => toggleStep(group.step.id)}
                            onViewInJourney={handleViewInJourney}
                            onShare={handleShare}
                        />
                    ))}
                </div>
            )}

            {/* Lesson Card Export Modal */}
            <LessonCardExport
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                lesson={selectedLesson}
                stepTitle={selectedStepTitle}
            />
        </div>
    )
}

function FilterButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${active
                    ? 'bg-brand-blue text-white shadow-lg border border-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
        >
            {children}
        </button>
    )
}

function StepGroupCard({ group, isExpanded, onToggle, onViewInJourney, onShare }) {
    const { step, lessons, hasSuccess, hasFailure } = group
    const lessonCount = lessons.length

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden backdrop-blur-sm"
        >
            {/* Step Header - Collapsible */}
            <button
                onClick={onToggle}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    {/* Step Status Icons */}
                    <div className="flex gap-1">
                        {hasSuccess && <CheckCircle className="text-emerald-400" size={20} />}
                        {hasFailure && <XCircle className="text-amber-400" size={20} />}
                    </div>

                    {/* Step Info */}
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                        <p className="text-sm text-white/50">
                            Step {step.order_index + 1} • {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
                        </p>
                    </div>
                </div>

                {/* Expand Icon */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onViewInJourney(step.id)
                        }}
                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        <MapPin size={14} />
                        View on Mountain
                    </button>
                    {isExpanded ? <ChevronUp size={24} className="text-white/50" /> : <ChevronDown size={24} className="text-white/50" />}
                </div>
            </button>

            {/* Lessons List - Expandable */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10"
                >
                    <div className="p-6 space-y-4">
                        {lessons.map(lesson => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                stepTitle={step.title}
                                onShare={() => onShare(lesson, step.title)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

function LessonCard({ lesson, onShare }) {
    const isSuccess = lesson.result === 'success'

    return (
        <div
            className={`
                group relative flex flex-col
                p-4 rounded-xl border transition-all duration-300
                ${isSuccess
                    ? 'bg-gradient-to-br from-emerald-900/10 to-transparent border-emerald-500/20'
                    : 'bg-gradient-to-br from-amber-900/10 to-transparent border-amber-500/20'
                }
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className={`
                    px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                    ${isSuccess
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }
                `}>
                    {isSuccess ? '✓ Success' : '✗ Learning'}
                </div>
                <div className="text-white/30 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(lesson.created_at).toLocaleDateString()}
                </div>
            </div>

            {/* Lesson Title (NEW!) */}
            {lesson.title && (
                <h4 className="text-lg font-bold mb-2 text-white/90">
                    {lesson.title}
                </h4>
            )}

            {/* Lesson Content - The Core */}
            <div className="flex-1 mb-4">
                {lesson.lesson_learned && (
                    <div className="flex gap-2 mb-3">
                        <Lightbulb
                            className={`flex-shrink-0 mt-1 ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}
                            size={16}
                        />
                        <p className="text-white/80 leading-relaxed italic text-sm">
                            "{lesson.lesson_learned}"
                        </p>
                    </div>
                )}
                {lesson.reflection_text && (
                    <p className="text-white/50 text-sm pl-6 border-l-2 border-white/10">
                        {lesson.reflection_text}
                    </p>
                )}
            </div>

            {/* Footer Action - Share Button */}
            <div className="pt-3 border-t border-white/10 mt-auto">
                <button
                    onClick={onShare}
                    className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-teal-300 transition-colors w-full group/share"
                >
                    <Share2 size={14} className="group-hover/share:scale-110 transition-transform" />
                    Share this lesson
                </button>
            </div>
        </div>
    )
}
