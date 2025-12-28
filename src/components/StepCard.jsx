import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, ArrowRight, Trash2, Pencil, Plus } from 'lucide-react'

/**
 * StepCard Component
 *
 * NEW FLOW:
 * - No more Success/Fail buttons on the card
 * - "Add Note" button opens modal where user documents what happened + selects outcome
 * - Step status is determined by the LATEST note's result
 * - Shows all notes with colored left border (green=success, red=failure)
 */
export default function StepCard({ step, notes = [], onAddNote, onViewNote, onEdit, onDelete }) {
    // Get all notes for this step (support multiple notes)
    const stepNotes = Array.isArray(notes) ? notes : (notes ? [notes] : [])
    const hasNotes = stepNotes.length > 0

    // Step status is determined by the latest note's result
    const latestNote = hasNotes ? stepNotes[stepNotes.length - 1] : null
    const derivedStatus = latestNote?.result || 'pending'

    const statusColors = {
        'success': 'border-brand-teal bg-brand-teal/10',
        'failed': 'border-red-500 bg-red-500/10',
        'failure': 'border-red-500 bg-red-500/10', // alias
        'in-progress': 'border-brand-gold bg-brand-gold/10',
        'pending': 'border-white/10 bg-white/5'
    }

    const StatusIcon = {
        'success': CheckCircle,
        'failed': XCircle,
        'failure': XCircle,
        'in-progress': Clock,
        'pending': ArrowRight
    }[derivedStatus] || ArrowRight

    const statusColor = statusColors[derivedStatus] || statusColors['pending']

    return (
        <motion.div
            layout
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${statusColor} backdrop-blur-sm transition-all hover:bg-white/10 group relative`}
        >
            {/* Edit/Delete Actions (Hover only on desktop, always visible on mobile) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(step); }}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-brand-gold transition-colors"
                    title="Edit step"
                >
                    <Pencil size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(step.id); }}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                    title="Delete step"
                >
                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-2 pr-10 sm:pr-12">
                <h3 className="font-bold text-base sm:text-lg line-clamp-2">{step.title}</h3>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {hasNotes && (
                        <span className="text-[10px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                            {stepNotes.length} {stepNotes.length === 1 ? 'note' : 'notes'}
                        </span>
                    )}
                    <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        derivedStatus === 'success' ? 'text-brand-teal' :
                        (derivedStatus === 'failed' || derivedStatus === 'failure') ? 'text-red-500' :
                        derivedStatus === 'in-progress' ? 'text-brand-gold' : 'text-white/50'
                    }`} />
                </div>
            </div>

            {step.description && (
                <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 line-clamp-2">{step.description}</p>
            )}

            {/* Notes Preview - Show latest notes with colored borders */}
            {hasNotes && (
                <div className="space-y-2 mb-3">
                    {stepNotes.slice(-2).map((note, index) => (
                        <div
                            key={note.id || index}
                            onClick={() => onViewNote(step, note)}
                            className={`p-2 sm:p-3 rounded-lg bg-black/20 border-l-4 cursor-pointer hover:bg-black/30 transition-colors ${
                                note.result === 'success' ? 'border-l-brand-teal' :
                                (note.result === 'failed' || note.result === 'failure') ? 'border-l-red-500' :
                                'border-l-white/20'
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                {note.result === 'success' ? (
                                    <CheckCircle size={12} className="text-brand-teal mt-0.5 flex-shrink-0" />
                                ) : (note.result === 'failed' || note.result === 'failure') ? (
                                    <XCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                                ) : null}
                                <p className="text-[10px] sm:text-xs text-white/60 line-clamp-2">
                                    {note.lesson_learned || note.reflection_text || 'Click to view note'}
                                </p>
                            </div>
                        </div>
                    ))}
                    {stepNotes.length > 2 && (
                        <p className="text-[10px] text-white/40 text-center">
                            +{stepNotes.length - 2} more notes
                        </p>
                    )}
                </div>
            )}

            {/* Add Note Button - Always visible */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onAddNote(step)
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-xs sm:text-sm font-medium transition-colors"
            >
                <Plus size={14} />
                Add Note
            </button>
        </motion.div>
    )
}
