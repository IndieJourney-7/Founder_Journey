import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useMountain } from '../context/MountainContext'
import { ArrowLeft, CheckCircle, XCircle, Calendar, MapPin, Lightbulb, BookOpen } from 'lucide-react'

export default function Lessons() {
    const { journeyNotes, steps } = useMountain()
    const navigate = useNavigate()
    const [filter, setFilter] = useState('all') // all, success, failed

    // Merge notes with step data
    const lessons = journeyNotes.map(note => {
        const step = steps.find(s => s.id === note.step_id)
        return {
            ...note,
            stepTitle: step?.title || 'Unknown Step',
            stepId: step?.id,
            stepStatus: step?.status
        }
    })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter(lesson => {
            if (filter === 'all') return true
            return lesson.result === filter // result stores 'success' or 'failed' (or 'failure' if normalized differently, let's assume result matches)
        })

    const handleViewInJourney = (stepId) => {
        navigate('/dashboard')
        // In a real app we might pass state to scroll to the step, 
        // but for now navigation is the primary goal.
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
                        All
                    </FilterButton>
                    <FilterButton active={filter === 'success'} onClick={() => setFilter('success')}>
                        Wins
                    </FilterButton>
                    <FilterButton active={filter === 'failed'} onClick={() => setFilter('failed')}>
                        Learnings
                    </FilterButton>
                </div>
            </div>

            {/* Gallery Grid */}
            {lessons.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <div className="text-6xl mb-4">🏔️</div>
                    <h3 className="text-xl font-bold mb-2">The trail is empty yet</h3>
                    <p className="text-white/50 mb-6">Complete steps on your mountain to leave markers on this trail.</p>
                    <Link to="/dashboard" className="px-6 py-3 bg-brand-teal text-brand-blue font-bold rounded-lg hover:bg-teal-400 transition-colors">
                        Go to Mountain
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map(lesson => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            onView={() => handleViewInJourney(lesson.stepId)}
                        />
                    ))}
                </div>
            )}
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

function LessonCard({ lesson, onView }) {
    const isSuccess = lesson.result === 'success'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                group relative flex flex-col
                p-6 rounded-2xl border transition-all duration-300
                ${isSuccess
                    ? 'bg-gradient-to-br from-emerald-900/20 to-brand-blue border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-gradient-to-br from-amber-900/20 to-brand-blue border-amber-500/20 hover:border-amber-500/40'
                }
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                    ${isSuccess
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }
                `}>
                    {isSuccess ? 'Success' : 'Learning'}
                </div>
                <div className="text-white/30 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(lesson.created_at).toLocaleDateString()}
                </div>
            </div>

            {/* Step Title */}
            <h3 className="text-lg font-bold mb-3 text-white/90 line-clamp-1 group-hover:text-white transition-colors">
                {lesson.stepTitle}
            </h3>

            {/* Lesson Content - The Core */}
            <div className="flex-1 mb-6">
                <div className="flex gap-2">
                    <Lightbulb
                        className={`flex-shrink-0 mt-1 ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}
                        size={18}
                    />
                    <p className="text-white/80 leading-relaxed italic">
                        "{lesson.lesson_learned || lesson.notes}"
                    </p>
                </div>
                {lesson.reflection_text && (
                    <p className="text-white/40 text-sm mt-4 pl-7 line-clamp-2 border-l-2 border-white/10">
                        {lesson.reflection_text}
                    </p>
                )}
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-white/10 mt-auto">
                <button
                    onClick={onView}
                    className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-brand-gold transition-colors w-full"
                >
                    <MapPin size={16} />
                    View on Mountain
                </button>
            </div>
        </motion.div>
    )
}
