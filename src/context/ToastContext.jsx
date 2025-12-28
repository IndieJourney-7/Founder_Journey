/**
 * Toast Context
 *
 * Global toast notification system.
 * Usage: const { showToast } = useToast()
 *        showToast({ type: 'success', title: 'Saved!', message: 'Your note was saved.' })
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer } from '../components/Toast'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now() + Math.random()

        setToasts(prev => [...prev, { id, type, title, message }])

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [removeToast])

    // Convenience methods
    const success = useCallback((title, message) => {
        return showToast({ type: 'success', title, message })
    }, [showToast])

    const error = useCallback((title, message) => {
        return showToast({ type: 'error', title, message, duration: 6000 })
    }, [showToast])

    const warning = useCallback((title, message) => {
        return showToast({ type: 'warning', title, message })
    }, [showToast])

    const info = useCallback((title, message) => {
        return showToast({ type: 'info', title, message })
    }, [showToast])

    const value = {
        showToast,
        success,
        error,
        warning,
        info,
        removeToast
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    )
}

export default ToastContext
