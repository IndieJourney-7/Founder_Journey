import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Share2, MessageSquare, TrendingUp, Code, Target, Lock, Gift, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMountain } from '../context/MountainContext'
import { useToast } from '../context/ToastContext'
import { usePlanLimits } from '../hooks/usePlanLimits'
import MountainDashboard from '../components/mountain/MountainDashboard'
import ProductShowcaseBanner from '../components/sharing/ProductShowcaseBanner'
import ProductGallery from '../components/ProductGallery'
import FeedbackModal from '../components/FeedbackModal'
import SignupPromptModal from '../components/SignupPromptModal'
import ShareButton from '../components/sharing/ShareButton'
import EncouragementsDashboard, { EncouragementWidget } from '../components/sharing/EncouragementsDashboard'
import EmbedWidget from '../components/sharing/EmbedWidget'
import LockMilestoneCard, { MilestoneUnlockCelebration } from '../components/LockMilestoneCard'
import DailyCheckIn, { QuickCheckIn } from '../components/DailyCheckIn'
import UpdateProgressModal from '../components/UpdateProgressModal'
import MilestoneSetupModal from '../components/MilestoneSetupModal'

export default function Dashboard() {
    const { user } = useAuth()
    const {
        currentMountain,
        steps,
        journeyNotes,
        milestones,
        currentMilestone,
        recentlyUnlockedMilestone,
        clearRecentlyUnlockedMilestone,
        progress,
        resolvedSteps,
        totalPlanned,
        refresh,
        isDemoMode,
        hasMetricProgress,
        updateProgressWithMilestones,
        setupMetricTracking,
        createMilestones,
        getCurrentMilestoneStreak
    } = useMountain()
    const { checkLimit, isPro } = usePlanLimits()
    const toast = useToast()

    // Data
    const goal = currentMountain ? { goal_amount: currentMountain.target } : { goal_amount: '' }
    const missionName = currentMountain ? currentMountain.title : ''
    const theme = 'startup'

    // UI State
    const [isProductBannerOpen, setIsProductBannerOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [showSignupPrompt, setShowSignupPrompt] = useState(false)
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
    const [signupPromptType, setSignupPromptType] = useState('stepLimit')
    const [isEncouragementsDashboardOpen, setIsEncouragementsDashboardOpen] = useState(false)
    const [isEmbedWidgetOpen, setIsEmbedWidgetOpen] = useState(false)
    const [isMilestoneSetupOpen, setIsMilestoneSetupOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('lock') // 'lock' | 'calendar'

    // Celebration trigger for milestone unlocks
    useEffect(() => {
        if (recentlyUnlockedMilestone) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#E7C778', '#1CC5A3', '#FFFFFF', '#FFD700']
            })
        }
    }, [recentlyUnlockedMilestone])

    // Check if we need milestone setup
    const needsMilestoneSetup = hasMetricProgress && milestones.length === 0

    // Handle progress update
    const handleProgressUpdate = async (newValue) => {
        const result = await updateProgressWithMilestones(newValue)
        if (result.success) {
            toast.success('Progress Updated', `Now at ${currentMountain?.metric_prefix || ''}${newValue.toLocaleString()}${currentMountain?.metric_suffix ? ' ' + currentMountain.metric_suffix : ''}`)

            if (result.newlyUnlocked?.length > 0) {
                // Celebration will show automatically via recentlyUnlockedMilestone
            }
        }
        setIsProgressModalOpen(false)
    }

    // Get streak for current milestone
    const currentStreak = currentMilestone ? getCurrentMilestoneStreak(currentMilestone.id) : null

    return (
        <div className="flex-1 flex flex-col relative">
            {/* Demo Mode Banner */}
            {isDemoMode && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-gold/20 to-yellow-500/20 text-brand-gold px-4 py-3 text-center text-sm font-medium z-50 border-b border-brand-gold/40 backdrop-blur-sm">
                    <span className="mr-2">🎨</span>
                    <span className="font-bold">Demo Mode</span>
                    <span className="mx-2 text-white/40">•</span>
                    <span className="text-white/80">Your data is saved locally</span>
                    <span className="mx-2 text-white/40">•</span>
                    <a href="/auth?mode=signup&from=demo" className="underline hover:text-white transition-colors font-semibold">
                        Sign up free to save permanently
                    </a>
                </div>
            )}

            {/* Header Actions */}
            <div className={`absolute ${isDemoMode ? 'top-16' : 'top-4'} right-2 sm:right-4 z-40 flex flex-col sm:flex-row gap-2`}>
                {!isPro && (
                    <Link to="/pricing" className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-brand-gold to-yellow-500 rounded-lg text-brand-blue font-bold hover:shadow-lg transition-all text-xs sm:text-sm whitespace-nowrap">
                        Upgrade
                    </Link>
                )}
                <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
                    title="Give Feedback"
                >
                    <MessageSquare size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                    onClick={() => setIsProductBannerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-md rounded-lg text-white hover:opacity-90 transition-all border border-white/20 font-medium text-sm"
                    title="Create & Share Progress Banner"
                >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Export</span>
                </button>
                {currentMountain?.is_public && (
                    <button
                        onClick={() => setIsEmbedWidgetOpen(true)}
                        className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
                        title="Get Embed Code"
                    >
                        <Code size={18} className="sm:w-5 sm:h-5" />
                    </button>
                )}
                <ShareButton />
            </div>

            {/* Progress Display */}
            <div className={`absolute ${isDemoMode ? 'top-16' : 'top-4'} left-2 sm:left-4 z-40 flex flex-col gap-2`}>
                <div className="bg-black/30 backdrop-blur-md rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-white/60">Progress</div>
                    <div className="text-xl sm:text-2xl font-bold text-brand-gold">{Math.round(progress)}%</div>
                    {hasMetricProgress ? (
                        <div className="text-[10px] sm:text-xs text-white/40">
                            {currentMountain?.metric_prefix}{currentMountain?.current_value?.toLocaleString() || 0} {currentMountain?.metric_suffix}
                            <span className="text-white/30"> / {currentMountain?.metric_prefix}{currentMountain?.target_value?.toLocaleString()}</span>
                        </div>
                    ) : (
                        <div className="text-[10px] sm:text-xs text-white/40">
                            {resolvedSteps}/{totalPlanned} done
                        </div>
                    )}
                    <button
                        onClick={() => setIsProgressModalOpen(true)}
                        className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold text-[10px] sm:text-xs font-medium rounded-md transition-colors"
                    >
                        <TrendingUp size={12} />
                        {hasMetricProgress ? 'Update' : 'Track Goal'}
                    </button>
                </div>

                {/* Current Streak Widget */}
                {currentMilestone && currentStreak && currentStreak.current_streak > 0 && (
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-lg px-3 py-2 border border-orange-500/30">
                        <div className="flex items-center gap-2">
                            <Flame size={18} className="text-orange-400" />
                            <div>
                                <div className="text-sm font-bold text-orange-400">
                                    {currentStreak.current_streak} day streak
                                </div>
                                <div className="text-[10px] text-white/50">
                                    {currentStreak.commitment_rate}% kept
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Encouragements Widget */}
                {currentMountain?.is_public && (
                    <div className="w-full max-w-[180px] sm:max-w-[200px]">
                        <EncouragementWidget onClick={() => setIsEncouragementsDashboardOpen(true)} />
                    </div>
                )}
            </div>

            {/* Mountain View */}
            <div className="flex-1 min-h-[400px] sm:min-h-[450px] bg-gradient-to-b from-[#0a1529] to-brand-blue relative overflow-hidden">
                <MountainDashboard
                    steps={steps}
                    stickyNotes={journeyNotes}
                    progress={progress}
                    theme={theme}
                    missionName={missionName}
                    goalTarget={goal.goal_amount}
                    hasMetricProgress={hasMetricProgress}
                    currentValue={currentMountain?.current_value || 0}
                    targetValue={currentMountain?.target_value || 0}
                    metricPrefix={currentMountain?.metric_prefix || ''}
                    metricSuffix={currentMountain?.metric_suffix || ''}
                    milestones={milestones}
                />
            </div>

            {/* Lock Milestone Panel */}
            <div className="min-h-[350px] bg-brand-blue border-t border-white/10 p-3 sm:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Product Gallery */}
                    <div className="mb-4">
                        <ProductGallery />
                    </div>

                    {/* Setup Milestones Prompt */}
                    {needsMilestoneSetup && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 rounded-2xl border-2 border-brand-gold/30 p-6 text-center mb-6"
                        >
                            <Lock size={40} className="mx-auto mb-3 text-brand-gold" />
                            <h3 className="text-xl font-bold text-brand-gold mb-2">Set Up Your Lock-In Journey</h3>
                            <p className="text-white/60 mb-4 max-w-md mx-auto">
                                Break your goal into milestones. Lock yourself into commitments and unlock rewards as you progress.
                            </p>
                            <button
                                onClick={() => setIsMilestoneSetupOpen(true)}
                                className="px-6 py-3 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                            >
                                Create Milestones
                            </button>
                        </motion.div>
                    )}

                    {/* Tab Switcher */}
                    {milestones.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveTab('lock')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'lock'
                                        ? 'bg-brand-gold text-brand-blue'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <Lock size={16} />
                                Current Lock
                            </button>
                            <button
                                onClick={() => setActiveTab('calendar')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'calendar'
                                        ? 'bg-brand-gold text-brand-blue'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <Target size={16} />
                                Promise Tracker
                            </button>
                        </div>
                    )}

                    {/* Content based on tab */}
                    {milestones.length > 0 && (
                        <div className="grid lg:grid-cols-2 gap-6">
                            {activeTab === 'lock' ? (
                                <>
                                    <LockMilestoneCard
                                        onUpdateProgress={() => setIsProgressModalOpen(true)}
                                    />
                                    {currentMilestone && (
                                        <QuickCheckIn
                                            milestoneId={currentMilestone.id}
                                            commitment={currentMilestone.commitment}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="lg:col-span-2">
                                    {currentMilestone && (
                                        <DailyCheckIn milestoneId={currentMilestone.id} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* No milestones and no metric tracking */}
                    {!hasMetricProgress && milestones.length === 0 && (
                        <div className="text-center py-10 text-white/50 border-2 border-dashed border-white/10 rounded-xl">
                            <Target size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="mb-2">Set up metric tracking to create milestones</p>
                            <button
                                onClick={() => setIsProgressModalOpen(true)}
                                className="text-brand-gold hover:underline font-bold"
                            >
                                Track Your Goal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Milestone Unlock Celebration */}
            <AnimatePresence>
                {recentlyUnlockedMilestone && (
                    <MilestoneUnlockCelebration
                        milestone={recentlyUnlockedMilestone}
                        onClose={clearRecentlyUnlockedMilestone}
                        onShare={() => {
                            setIsProductBannerOpen(true)
                            clearRecentlyUnlockedMilestone()
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Update Progress Modal */}
            <UpdateProgressModal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                currentMountain={currentMountain}
                hasMetricProgress={hasMetricProgress}
                onUpdateProgress={handleProgressUpdate}
                onSetupMetric={async (metricData) => {
                    await setupMetricTracking(metricData)
                    setIsProgressModalOpen(false)
                    // After setting up metric, prompt for milestones
                    setTimeout(() => setIsMilestoneSetupOpen(true), 500)
                }}
            />

            {/* Milestone Setup Modal */}
            <MilestoneSetupModal
                isOpen={isMilestoneSetupOpen}
                onClose={() => setIsMilestoneSetupOpen(false)}
                targetValue={currentMountain?.target_value || 0}
                metricPrefix={currentMountain?.metric_prefix || ''}
                metricSuffix={currentMountain?.metric_suffix || ''}
                onSave={async (milestonesData) => {
                    await createMilestones(milestonesData)
                    setIsMilestoneSetupOpen(false)
                    toast.success('Milestones Created', `${milestonesData.length} milestones locked in!`)
                }}
            />

            {/* Product Showcase Banner */}
            <ProductShowcaseBanner
                isOpen={isProductBannerOpen}
                onClose={() => setIsProductBannerOpen(false)}
            />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Signup Prompt Modal */}
            <SignupPromptModal
                isOpen={showSignupPrompt}
                onClose={() => setShowSignupPrompt(false)}
                promptType={signupPromptType}
            />

            {/* Encouragements Dashboard Modal */}
            <EncouragementsDashboard
                isOpen={isEncouragementsDashboardOpen}
                onClose={() => setIsEncouragementsDashboardOpen(false)}
            />

            {/* Embed Widget Modal */}
            <EmbedWidget
                isOpen={isEmbedWidgetOpen}
                onClose={() => setIsEmbedWidgetOpen(false)}
            />
        </div>
    )
}
