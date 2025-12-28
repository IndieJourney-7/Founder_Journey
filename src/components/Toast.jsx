/**
 * Toast Notification Component
 *
 * Beautiful, animated toast notifications for user feedback.
 * Supports success, error, info, and warning types.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
}

const colorMap = {
    success: {
        bg: 'bg-brand-teal/20',
        border: 'border-brand-teal/50',
        icon: 'text-brand-teal',
        text: 'text-brand-teal'
    },
    error: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        icon: 'text-red-400',
        text: 'text-red-400'
    },
    warning: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        icon: 'text-yellow-400',
        text: 'text-yellow-400'
    },
    info: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/50',
        icon: 'text-blue-400',
        text: 'text-blue-400'
    }
}

export function Toast({ id, type = 'info', title, message, onClose }) {
    const Icon = iconMap[type] || Info
    const colors = colorMap[type] || colorMap.info

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
                relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg
                ${colors.bg} ${colors.border}
                min-w-[280px] max-w-[400px]
            `}
        >
            <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                {title && (
                    <p className={`font-bold text-sm ${colors.text}`}>
                        {title}
                    </p>
                )}
                {message && (
                    <p className="text-white/80 text-sm mt-0.5">
                        {message}
                    </p>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    )
}

export function ToastContainer({ toasts, onClose }) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default Toast
