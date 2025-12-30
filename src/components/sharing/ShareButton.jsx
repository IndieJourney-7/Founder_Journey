import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, X, ExternalLink } from 'lucide-react'
import { useMountain } from '../../context/MountainContext'
import { useToast } from '../../context/ToastContext'

export default function ShareButton({ className = '' }) {
    const { currentMountain } = useMountain()
    const toast = useToast()
    const [showModal, setShowModal] = useState(false)
    const [copied, setCopied] = useState(false)

    const username = currentMountain?.username
    const isPublic = currentMountain?.is_public

    if (!username || !isPublic) {
        return null
    }

    const shareUrl = `${window.location.origin}/climb/@${username}`
    const progress = currentMountain?.current_value && currentMountain?.target_value
        ? Math.round((currentMountain.current_value / currentMountain.target_value) * 100)
        : null

    const tweetText = progress !== null
        ? `I'm ${progress}% towards "${currentMountain.title}" on my SHIFT ASCENT journey! 🏔️\n\nFollow my progress:`
        : `Check out my journey: "${currentMountain.title}" on SHIFT ASCENT! 🏔️\n\nFollow my progress:`

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success('Link Copied!', 'Share your journey with others')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error('Copy Failed', 'Could not copy link')
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold rounded-lg transition-colors border border-brand-gold/30 ${className}`}
            >
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share Journey</span>
            </button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#0F1F3D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Preview Card */}
                            <div className="p-6 bg-gradient-to-br from-brand-blue to-[#0a1529] border-b border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-brand-blue font-bold text-lg">
                                        {username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">@{username}</p>
                                        <p className="text-sm text-white/50">SHIFT ASCENT</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{currentMountain.title}</h3>
                                <p className="text-white/60 text-sm">{currentMountain.target}</p>
                                {progress !== null && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/50">Progress</span>
                                            <span className="font-bold text-brand-teal">{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-teal to-brand-gold"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Share Options */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-white">Share Your Journey</h4>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-1 hover:bg-white/10 rounded-lg"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>

                                {/* URL Copy */}
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white/80 text-sm font-mono"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            copied
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Social Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 bg-black hover:bg-black/80 rounded-xl transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        <span className="font-medium">Share on X</span>
                                    </a>
                                    <a
                                        href={linkedInUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 bg-[#0077B5] hover:bg-[#006699] rounded-xl transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span className="font-medium">LinkedIn</span>
                                    </a>
                                </div>

                                {/* View Public Profile */}
                                <a
                                    href={`/climb/@${username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View Public Profile</span>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
