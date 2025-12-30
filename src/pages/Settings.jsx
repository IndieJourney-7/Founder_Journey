import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Palette,
    Sparkles,
    Mountain,
    Download,
    RotateCcw,
    User,
    Crown,
    ChevronRight,
    Check,
    AlertTriangle,
    Zap,
    Moon,
    Sun,
    Share2,
    Globe,
    Lock,
    Link as LinkIcon,
    Copy,
    ExternalLink,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMountain } from '../context/MountainContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { usePlanLimits } from '../hooks/usePlanLimits'
import { THEME_CATEGORIES, getThemesByCategory } from '../config/themes'
import {
    validateUsername,
    checkUsernameAvailable,
    claimUsername,
    updatePublicSettings
} from '../lib/publicProfileService'

// Particle Intensity Slider Component
const ParticleIntensitySlider = ({ value, onChange }) => {
    const intensityLabels = ['Off', 'Low', 'Medium', 'High', 'Ultra']
    const intensityValues = [0, 0.3, 0.7, 1, 1.5]

    const currentIndex = intensityValues.findIndex(v => v === value) !== -1
        ? intensityValues.findIndex(v => v === value)
        : 2 // Default to medium

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Particle Effects</span>
                <span className="text-sm font-medium text-brand-gold">{intensityLabels[currentIndex]}</span>
            </div>
            <input
                type="range"
                min="0"
                max="4"
                value={currentIndex}
                onChange={(e) => onChange(intensityValues[parseInt(e.target.value)])}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:shadow-brand-gold/30 [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-white/40">
                {intensityLabels.map((label, i) => (
                    <span key={i} className={currentIndex === i ? 'text-brand-gold' : ''}>{label}</span>
                ))}
            </div>
        </div>
    )
}

// Theme Card Component
const ThemeCard = ({ theme, isActive, onSelect }) => {
    return (
        <motion.button
            onClick={() => onSelect(theme.id)}
            className={`relative p-3 rounded-xl border-2 transition-all text-left w-full ${
                isActive
                    ? 'border-brand-teal bg-brand-teal/10'
                    : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Theme Preview */}
            <div
                className="h-12 rounded-lg mb-2 overflow-hidden relative"
                style={{
                    background: `linear-gradient(to bottom, ${theme.sky.from}, ${theme.sky.via || theme.sky.to}, ${theme.sky.to})`
                }}
            >
                {/* Mini mountain preview */}
                <svg viewBox="0 0 100 40" className="absolute bottom-0 w-full" preserveAspectRatio="none">
                    <path
                        d="M0 40 L20 20 L40 30 L60 10 L80 25 L100 15 L100 40 Z"
                        fill={theme.mountains.front.start}
                        opacity="0.8"
                    />
                </svg>

                {/* Active indicator */}
                {isActive && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-brand-teal rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}

                {/* Special badge */}
                {theme.isSpecial && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-[8px] font-bold text-black rounded-full flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" />
                        LIMITED
                    </div>
                )}
            </div>

            {/* Theme Name */}
            <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isActive ? 'text-brand-teal' : 'text-white'}`}>
                    {theme.name}
                </span>
            </div>
        </motion.button>
    )
}

// Settings Section Component
const SettingsSection = ({ icon: Icon, title, description, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 md:p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
                <div className="p-2.5 bg-gradient-to-br from-brand-gold/20 to-brand-teal/20 rounded-xl">
                    <Icon className="w-5 h-5 text-brand-gold" />
                </div>
                <div className="flex-1 text-left">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-sm text-white/50">{description}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 md:px-5 pb-5 pt-2 border-t border-white/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function Settings() {
    const { user } = useAuth()
    const { currentMountain, isDemoMode, refresh } = useMountain()
    const { currentThemeId, currentTheme, setTheme, availableThemes } = useTheme()
    const { isPro } = usePlanLimits()
    const toast = useToast()

    const [particleIntensity, setParticleIntensity] = useState(() => {
        try {
            const saved = localStorage.getItem('shift_particle_intensity')
            return saved ? parseFloat(saved) : 1
        } catch {
            return 1
        }
    })

    const [showResetConfirm, setShowResetConfirm] = useState(false)

    // Public Profile State
    const [username, setUsername] = useState(currentMountain?.username || '')
    const [usernameInput, setUsernameInput] = useState('')
    const [usernameError, setUsernameError] = useState('')
    const [usernameAvailable, setUsernameAvailable] = useState(null)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [claimingUsername, setClaimingUsername] = useState(false)
    const [isPublic, setIsPublic] = useState(currentMountain?.is_public || false)
    const [publicBio, setPublicBio] = useState(currentMountain?.public_bio || '')
    const [savingPublicSettings, setSavingPublicSettings] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)

    // Sync state when mountain loads
    useEffect(() => {
        if (currentMountain) {
            setUsername(currentMountain.username || '')
            setIsPublic(currentMountain.is_public || false)
            setPublicBio(currentMountain.public_bio || '')
        }
    }, [currentMountain])

    // Check username availability with debounce
    useEffect(() => {
        if (!usernameInput || usernameInput === username) {
            setUsernameError('')
            setUsernameAvailable(null)
            return
        }

        const validation = validateUsername(usernameInput)
        if (!validation.valid) {
            setUsernameError(validation.error)
            setUsernameAvailable(false)
            return
        }

        setUsernameError('')
        setCheckingUsername(true)

        const timer = setTimeout(async () => {
            const result = await checkUsernameAvailable(usernameInput)
            setCheckingUsername(false)
            setUsernameAvailable(result.available)
            if (!result.available && result.error) {
                setUsernameError(result.error)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [usernameInput, username])

    // Handle username claim
    const handleClaimUsername = async () => {
        if (!currentMountain || !usernameAvailable || claimingUsername) return

        setClaimingUsername(true)
        const result = await claimUsername(currentMountain.id, usernameInput)

        if (result.success) {
            setUsername(usernameInput)
            setUsernameInput('')
            setUsernameAvailable(null)
            toast.success('Username Claimed!', `Your profile is now at /climb/@${usernameInput}`)
            refresh()
        } else {
            toast.error('Failed to Claim', result.error || 'Could not claim username')
        }

        setClaimingUsername(false)
    }

    // Handle public settings update
    const handleSavePublicSettings = async () => {
        if (!currentMountain || savingPublicSettings) return

        setSavingPublicSettings(true)
        const result = await updatePublicSettings(currentMountain.id, {
            is_public: isPublic,
            public_bio: publicBio
        })

        if (result.success) {
            toast.success('Settings Saved', isPublic ? 'Your profile is now public!' : 'Your profile is now private')
            refresh()
        } else {
            toast.error('Failed to Save', result.error || 'Could not update settings')
        }

        setSavingPublicSettings(false)
    }

    // Copy share link
    const handleCopyLink = async () => {
        if (!username) return

        const url = `${window.location.origin}/climb/@${username}`
        try {
            await navigator.clipboard.writeText(url)
            setLinkCopied(true)
            toast.success('Link Copied!', 'Share your journey with others')
            setTimeout(() => setLinkCopied(false), 2000)
        } catch (err) {
            toast.error('Copy Failed', 'Could not copy link')
        }
    }

    // Handle particle intensity change
    const handleParticleIntensityChange = (value) => {
        setParticleIntensity(value)
        try {
            localStorage.setItem('shift_particle_intensity', value.toString())
        } catch (e) {
            console.error('Error saving particle intensity:', e)
        }
        toast.success('Settings Saved', 'Particle intensity updated')
    }

    // Export journey data
    const handleExportData = () => {
        try {
            const data = {
                exportedAt: new Date().toISOString(),
                mountain: currentMountain,
                // Add more data as needed
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `shift-journey-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success('Data Exported', 'Your journey data has been downloaded')
        } catch (error) {
            toast.error('Export Failed', 'Could not export your data')
        }
    }

    // Reset journey (demo mode only)
    const handleResetJourney = () => {
        if (!isDemoMode) return

        try {
            localStorage.removeItem('shift_demo_mountain')
            localStorage.removeItem('shift_demo_steps')
            localStorage.removeItem('shift_demo_notes')
            refresh()
            setShowResetConfirm(false)
            toast.success('Journey Reset', 'Your demo journey has been reset')
            // Redirect to dashboard to reinitialize
            window.location.href = '/dashboard'
        } catch (error) {
            toast.error('Reset Failed', 'Could not reset your journey')
        }
    }

    return (
        <div className="flex-1 bg-gradient-to-b from-brand-blue to-[#0a1529] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-xl shadow-lg shadow-brand-gold/20">
                            <SettingsIcon className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
                            <p className="text-white/50 text-sm">Customize your journey experience</p>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-4">
                    {/* Appearance Section */}
                    <SettingsSection
                        icon={Palette}
                        title="Appearance"
                        description="Themes and visual effects"
                        defaultOpen={true}
                    >
                        <div className="space-y-6">
                            {/* Current Theme Display */}
                            <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                                <div
                                    className="w-16 h-16 rounded-xl overflow-hidden relative"
                                    style={{
                                        background: `linear-gradient(to bottom, ${currentTheme.sky.from}, ${currentTheme.sky.to})`
                                    }}
                                >
                                    <svg viewBox="0 0 100 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
                                        <path
                                            d="M0 60 L20 30 L40 45 L60 15 L80 35 L100 20 L100 60 Z"
                                            fill={currentTheme.mountains.front.start}
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{currentTheme.name}</span>
                                        {currentTheme.isSpecial && (
                                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-bold text-black rounded-full">
                                                LIMITED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/50">{currentTheme.description}</p>
                                </div>
                            </div>

                            {/* Theme Grid by Category */}
                            {THEME_CATEGORIES.map(category => {
                                const categoryThemes = getThemesByCategory(category.id)
                                if (categoryThemes.length === 0) return null

                                return (
                                    <div key={category.id}>
                                        <h4 className="text-sm font-medium text-white/60 mb-3">{category.name}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {categoryThemes.map(theme => (
                                                <ThemeCard
                                                    key={theme.id}
                                                    theme={theme}
                                                    isActive={currentThemeId === theme.id}
                                                    onSelect={setTheme}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Particle Intensity */}
                            <div className="pt-4 border-t border-white/10">
                                <ParticleIntensitySlider
                                    value={particleIntensity}
                                    onChange={handleParticleIntensityChange}
                                />
                                <p className="text-xs text-white/40 mt-2">
                                    Reduce particle effects for better performance on older devices
                                </p>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Public Profile & Sharing */}
                    {user && currentMountain && !isDemoMode && (
                        <SettingsSection
                            icon={Share2}
                            title="Public Profile & Sharing"
                            description="Share your journey with the world"
                        >
                            <div className="space-y-6">
                                {/* Username Section */}
                                <div>
                                    <h4 className="text-sm font-medium text-white/60 mb-3">Your Profile URL</h4>

                                    {username ? (
                                        // Has username - show it
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl">
                                                <div className="flex-1">
                                                    <p className="text-sm text-white/50">Your shareable link</p>
                                                    <p className="font-mono text-brand-teal">
                                                        {window.location.origin}/climb/@{username}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleCopyLink}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        linkCopied
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-white/10 hover:bg-white/20 text-white/60'
                                                    }`}
                                                >
                                                    {linkCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                                <a
                                                    href={`/climb/@${username}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5 text-white/60" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        // No username - claim one
                                        <div className="space-y-3">
                                            <p className="text-sm text-white/50">
                                                Claim a username to create your public profile URL
                                            </p>
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                                    <input
                                                        type="text"
                                                        value={usernameInput}
                                                        onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
                                                        placeholder="yourname"
                                                        maxLength={20}
                                                        className="w-full pl-8 pr-10 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                                                    />
                                                    {/* Status indicator */}
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {checkingUsername && (
                                                            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                                                        )}
                                                        {!checkingUsername && usernameAvailable === true && (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        )}
                                                        {!checkingUsername && usernameAvailable === false && (
                                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleClaimUsername}
                                                    disabled={!usernameAvailable || claimingUsername}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        usernameAvailable && !claimingUsername
                                                            ? 'bg-brand-teal text-brand-blue hover:bg-brand-teal/80'
                                                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {claimingUsername ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        'Claim'
                                                    )}
                                                </button>
                                            </div>
                                            {usernameError && (
                                                <p className="text-sm text-red-400">{usernameError}</p>
                                            )}
                                            <p className="text-xs text-white/30">
                                                3-20 characters, letters, numbers, and underscores only
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Privacy Toggle */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-medium text-white/60 mb-3">Profile Visibility</h4>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsPublic(false)}
                                            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                                !isPublic
                                                    ? 'border-brand-teal bg-brand-teal/10'
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <Lock className={`w-5 h-5 ${!isPublic ? 'text-brand-teal' : 'text-white/40'}`} />
                                            <div className="text-left">
                                                <p className={`font-medium ${!isPublic ? 'text-brand-teal' : 'text-white'}`}>Private</p>
                                                <p className="text-xs text-white/50">Only you can see</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setIsPublic(true)}
                                            disabled={!username}
                                            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                                isPublic
                                                    ? 'border-brand-gold bg-brand-gold/10'
                                                    : !username
                                                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                                                        : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <Globe className={`w-5 h-5 ${isPublic ? 'text-brand-gold' : 'text-white/40'}`} />
                                            <div className="text-left">
                                                <p className={`font-medium ${isPublic ? 'text-brand-gold' : 'text-white'}`}>Public</p>
                                                <p className="text-xs text-white/50">
                                                    {username ? 'Anyone can view' : 'Claim username first'}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Bio */}
                                {username && (
                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-sm font-medium text-white/60 mb-3">Public Bio (optional)</h4>
                                        <textarea
                                            value={publicBio}
                                            onChange={(e) => setPublicBio(e.target.value)}
                                            placeholder="A short bio about you or your journey..."
                                            maxLength={160}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-brand-teal focus:outline-none resize-none"
                                        />
                                        <p className="text-xs text-white/30 mt-1">{publicBio.length}/160 characters</p>
                                    </div>
                                )}

                                {/* Save Button */}
                                {username && (
                                    <button
                                        onClick={handleSavePublicSettings}
                                        disabled={savingPublicSettings}
                                        className="w-full py-3 bg-brand-gold hover:bg-yellow-400 text-brand-blue font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {savingPublicSettings ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </SettingsSection>
                    )}

                    {/* Journey Management */}
                    <SettingsSection
                        icon={Mountain}
                        title="Journey Management"
                        description="Export data and manage your mountain"
                    >
                        <div className="space-y-4">
                            {/* Current Journey Info */}
                            {currentMountain && (
                                <div className="p-4 bg-black/20 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Mountain className="w-5 h-5 text-brand-gold" />
                                        <span className="font-semibold">{currentMountain.title}</span>
                                    </div>
                                    <p className="text-sm text-white/50">Target: {currentMountain.target}</p>
                                    {isDemoMode && (
                                        <div className="mt-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg inline-flex items-center gap-1.5 text-xs text-yellow-500">
                                            <Zap className="w-3 h-3" />
                                            Demo Mode - Data stored locally
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Export Data */}
                            <button
                                onClick={handleExportData}
                                className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                            >
                                <Download className="w-5 h-5 text-brand-teal group-hover:scale-110 transition-transform" />
                                <div className="flex-1 text-left">
                                    <span className="font-medium">Export Journey Data</span>
                                    <p className="text-sm text-white/50">Download your progress as JSON</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/40" />
                            </button>

                            {/* Reset Journey (Demo only) */}
                            {isDemoMode && (
                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setShowResetConfirm(true)}
                                        className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors group"
                                    >
                                        <RotateCcw className="w-5 h-5 text-red-400 group-hover:rotate-180 transition-transform duration-500" />
                                        <div className="flex-1 text-left">
                                            <span className="font-medium text-red-400">Reset Demo Journey</span>
                                            <p className="text-sm text-white/50">Start fresh with a new mountain</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </SettingsSection>

                    {/* Account Section */}
                    <SettingsSection
                        icon={User}
                        title="Account"
                        description="Profile and subscription"
                    >
                        <div className="space-y-4">
                            {user ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-brand-blue font-bold text-lg">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {isPro ? (
                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Crown className="w-3 h-3" />
                                                        Summit Pro
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs font-medium rounded-full">
                                                        Free Plan
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upgrade CTA (if not Pro) */}
                                    {!isPro && (
                                        <Link
                                            to="/pricing"
                                            className="block w-full p-4 bg-gradient-to-r from-brand-gold/20 to-yellow-500/20 hover:from-brand-gold/30 hover:to-yellow-500/30 border border-brand-gold/30 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Crown className="w-6 h-6 text-brand-gold" />
                                                <div className="flex-1">
                                                    <span className="font-semibold text-brand-gold">Upgrade to Summit Pro</span>
                                                    <p className="text-sm text-white/50">Unlimited steps, priority support & more</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-brand-gold group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </Link>
                                    )}

                                    {/* Profile Link */}
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <User className="w-5 h-5 text-white/60" />
                                        <span className="flex-1">View Full Profile</span>
                                        <ChevronRight className="w-5 h-5 text-white/40" />
                                    </Link>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="w-8 h-8 text-white/40" />
                                    </div>
                                    <p className="text-white/60 mb-4">Sign in to save your progress permanently</p>
                                    <Link
                                        to="/auth"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                                    >
                                        Sign In / Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </SettingsSection>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-white/30 text-sm">
                    <p>SHIFT ASCENT v1.0</p>
                    <p className="mt-1">Built with passion for founders</p>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowResetConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#0F1F3D] border border-white/10 rounded-2xl p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold">Reset Journey?</h3>
                            </div>

                            <p className="text-white/60 mb-6">
                                This will permanently delete your demo mountain, all steps, and notes. This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetJourney}
                                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
                                >
                                    Reset Everything
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
