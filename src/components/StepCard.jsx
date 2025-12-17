import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, ArrowRight, FileText, Trash2, Pencil } from 'lucide-react'

export default function StepCard({ step, note, onUpdateStatus, onViewNote, onEdit, onDelete }) {
    const statusColors = {
        'success': 'border-brand-teal bg-brand-teal/10',
        'failed': 'border-red-500 bg-red-500/10',
        'in-progress': 'border-brand-gold bg-brand-gold/10',
        'pending': 'border-white/10 bg-white/5'
    }

    const StatusIcon = {
        'success': CheckCircle,
        'failed': XCircle,
        'in-progress': Clock,
        'pending': ArrowRight
    }[step.status]

    const isResolved = step.status === 'success' || step.status === 'failed'
    const hasNote = !!note

    return (
        <motion.div
            layout
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${statusColors[step.status]} backdrop-blur-sm transition-all hover:bg-white/10 group relative ${isResolved ? 'cursor-pointer' : ''}`}
            onClick={isResolved && hasNote ? () => onViewNote(step, note) : undefined}
        >
            {/* Edit/Delete Actions (Hover only on desktop, always visible on mobile) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(step); }}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-brand-gold transition-colors"
                >
                    <Pencil size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(step.id); }}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
            </div>

            <div className="flex justify-between items-start mb-2 pr-10 sm:pr-12">
                <h3 className="font-bold text-base sm:text-lg line-clamp-2">{step.title}</h3>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {hasNote && (
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold" title="Has reflection note" />
                    )}
                    <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${step.status === 'success' ? 'text-brand-teal' :
                        step.status === 'failed' ? 'text-red-500' :
                            step.status === 'in-progress' ? 'text-brand-gold' : 'text-white/50'
                        }`} />
                </div>
            </div>

            {step.description && (
                <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 line-clamp-2">{step.description}</p>
            )}

            {/* Show note preview if resolved */}
            {isResolved && hasNote && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-[10px] sm:text-xs text-white/60 line-clamp-2">
                        💡 {note.lesson_learned || note.notes || 'Click to view note'}
                    </p>
                </div>
            )}

            {/* Action buttons only for pending/in-progress steps */}
            {!isResolved && (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(step.id, 'success')
                        }}
                        className="flex-1 py-1.5 sm:py-2 rounded bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal text-[10px] sm:text-xs font-bold transition-colors"
                    >
                        Success
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(step.id, 'failed')
                        }}
                        className="flex-1 py-1.5 sm:py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[10px] sm:text-xs font-bold transition-colors"
                    >
                        Fail
                    </button>
                </div>
            )}

            {/* View note prompt for resolved steps */}
            {isResolved && (
                <div className="text-center">
                    <span className="text-[10px] sm:text-xs text-white/40">
                        Click to view reflection
                    </span>
                </div>
            )}
        </motion.div>
    )
}
