import { useAuth } from '../context/AuthContext'
import { useMountain } from '../context/MountainContext'
import { Trophy, Target, TrendingUp, AlertCircle, Mountain, BookOpen } from 'lucide-react'

export default function Profile() {
    const { user } = useAuth()
    const { currentMountain, steps, journeyNotes, progress, successfulSteps, resolvedSteps, totalPlanned } = useMountain()

    // Calculate stats from context data
    const totalSteps = steps.length
    const failedSteps = steps.filter(s => s.status === 'failed').length
    const successRate = resolvedSteps > 0 ? Math.round((successfulSteps / resolvedSteps) * 100) : 0
    const wisdomCount = journeyNotes.length

    return (
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full text-white">
            {/* Header Profile Section */}
            <div className="flex items-center gap-6 mb-12 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-3xl font-bold text-brand-blue shadow-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'F'}
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-2">Founder Profile</h1>
                    <p className="text-white/60 text-lg">{user?.email}</p>
                    <div className="flex gap-3 mt-3">
                        <span className="px-3 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-bold border border-brand-teal/30">
                            Free Plan
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/50 text-xs font-bold border border-white/10">
                            Early Adopter
                        </span>
                    </div>
                </div>
            </div>

            {/* Current Mountain Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Mountain className="text-brand-gold" />
                    Current Ascent
                </h2>

                {currentMountain ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[#0F1F3D] to-brand-blue border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-all" />

                            <h3 className="text-2xl font-bold mb-1 relative z-10">{currentMountain.title}</h3>
                            <p className="text-white/60 mb-6 relative z-10">Target: <span className="text-brand-gold font-bold">{currentMountain.target}</span></p>

                            <div className="bg-black/30 rounded-xl p-4 relative z-10">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/70">Journey Progress</span>
                                    <span className="font-bold text-brand-teal">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-teal to-brand-gold transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="mt-2 text-xs text-white/40 flex justify-between">
                                    <span>{resolvedSteps} completed</span>
                                    <span>{totalPlanned} planned</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-rows-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
                                <div className="text-white/60 text-sm font-medium mb-1">Total Wisdom</div>
                                <div className="text-3xl font-bold text-white flex items-center gap-2">
                                    {wisdomCount}
                                    <BookOpen size={20} className="text-brand-purple opacity-50" />
                                </div>
                                <p className="text-xs text-white/30 mt-1">Reflections recorded</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
                                <div className="text-white/60 text-sm font-medium mb-1">Strategies</div>
                                <div className="text-3xl font-bold text-white">{totalSteps}</div>
                                <p className="text-xs text-white/30 mt-1">Hypotheses created</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-white/50">
                        No mountain started yet.
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-brand-teal" />
                Performance Stats
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
                <StatCard icon={Target} label="Total Steps" value={totalSteps} color="text-white" />
                <StatCard icon={Trophy} label="Wins" value={successfulSteps} color="text-brand-teal" />
                <StatCard icon={AlertCircle} label="Learning Moments" value={failedSteps} color="text-red-500" />
                <StatCard icon={TrendingUp} label="Success Rate" value={`${successRate}%`} color="text-brand-gold" />
            </div>

            {/* Achievements */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AchievementCard title="First Step" unlocked={totalSteps > 0} />
                <AchievementCard title="First Win" unlocked={successfulSteps > 0} />
                <AchievementCard title="Resilient" unlocked={failedSteps > 0} />
                <AchievementCard title="Halfway There" unlocked={progress >= 50} />
                <AchievementCard title="Summit Reached" unlocked={progress >= 100} />
                <AchievementCard title="Quick Learner" unlocked={wisdomCount >= 3} />
                <AchievementCard title="Strategist" unlocked={totalSteps >= 5} />
                <AchievementCard title="Wisdom Keeper" unlocked={wisdomCount >= 10} />
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-white/60 text-sm font-medium">{label}</span>
            </div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    )
}

function AchievementCard({ title, unlocked }) {
    return (
        <div className={`p-4 rounded-xl border transition-all ${unlocked
                ? 'bg-brand-gold/10 border-brand-gold text-brand-gold shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                : 'bg-white/5 border-white/10 text-white/20 grayscale'
            } flex flex-col items-center text-center gap-3`}>
            <div className={`p-3 rounded-full ${unlocked ? 'bg-brand-gold/20' : 'bg-white/5'}`}>
                <Trophy className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm">{title}</span>
        </div>
    )
}
