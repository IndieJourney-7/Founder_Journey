import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PaymentCancel() {
    return (
        <div className="min-h-screen bg-[#0F1F3D] flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl"
                >
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 text-white/50">
                        <XCircle size={32} strokeWidth={2} />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h2>
                    <p className="text-white/60 mb-8">
                        No worries, your card has not been charged. <br />
                        You remain on the <span className="text-brand-gold">Base Camp</span> plan.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/pricing"
                            className="w-full py-3 rounded-xl bg-brand-gold text-brand-blue font-bold hover:bg-yellow-400 transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            to="/dashboard"
                            className="w-full py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Return to Dashboard
                        </Link>
                    </div>
                </motion.div>

                <p className="text-white/20 text-xs mt-8">
                    If you experienced an error, please contact support.
                </p>
            </div>
        </div>
    )
}
