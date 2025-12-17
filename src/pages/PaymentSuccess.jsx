import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function PaymentSuccess() {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [status, setStatus] = useState('processing') // processing, success, error
    const [errorMessage, setErrorMessage] = useState('')
    const processedRef = useRef(false) // Track if we've already tried to process

    useEffect(() => {
        const processUpgrade = async () => {
            if (!user) return

            // Prevent multiple executions (infinite loop fix)
            if (processedRef.current) return
            processedRef.current = true

            try {
                // Call backend to verify payment with Dodo API and upgrade user
                const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3001'
                const response = await fetch(`${webhookUrl}/verify-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                })

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || 'Payment verification failed')
                }

                // Refresh Auth Context to reflect change
                if (refreshUser) await refreshUser()

                setStatus('success')

                // Celebration
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#EAB308', '#14B8A6', '#ffffff']
                })

                // Redirect after delay
                setTimeout(() => {
                    navigate('/dashboard')
                }, 3000)

            } catch (error) {
                console.error('Upgrade failed:', error)
                setErrorMessage(error.message || 'Unknown error occurred')
                setStatus('error')
            }
        }

        processUpgrade()
    }, [user, navigate, refreshUser])

    return (
        <div className="min-h-screen bg-[#0F1F3D] flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
                {status === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <Loader size={48} className="text-brand-gold animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Securing Your Summit Pass...</h2>
                        <p className="text-white/60">Please wait while we unlock your unlimited access.</p>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-brand-teal/10 border border-brand-teal/30 p-8 rounded-3xl"
                    >
                        <div className="mx-auto w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mb-6 text-[#0F1F3D]">
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">You're Pro!</h2>
                        <p className="text-white/80 mb-6">
                            Your account has been upgraded. Get ready to climb without limits.
                        </p>
                        <p className="text-sm text-white/40">Redirecting to dashboard...</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
                        <p className="text-white/60 mb-6">
                            We couldn't verify the upgrade automatically.
                            <br />
                            <span className="text-xs text-red-400 mt-2 block font-mono bg-black/20 p-2 rounded break-all">
                                {errorMessage}
                            </span>
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
