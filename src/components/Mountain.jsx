import { motion } from 'framer-motion'

export default function Mountain({ steps = [], progress = 0 }) {
    // Calculate path points for a realistic winding trail
    const pathPoints = steps.map((step, index) => {
        const totalSteps = steps.length || 1
        const normalizedIndex = (index + 1) / (totalSteps + 1)

        // Create a winding S-curve path
        const baseY = 85 - (normalizedIndex * 70) // Bottom to top (85% to 15%)
        const baseX = 15 + (normalizedIndex * 70) // Left to right with curve

        // Add horizontal wave for winding effect
        const wave = Math.sin(normalizedIndex * Math.PI * 3) * 15
        const x = baseX + wave

        return { x, y: baseY, step, index }
    })

    // Avatar position based on progress
    const avatarProgress = progress / 100
    const avatarY = 85 - (avatarProgress * 70)
    const avatarX = 15 + (avatarProgress * 70) + Math.sin(avatarProgress * Math.PI * 3) * 15

    return (
        <div className="relative w-full h-full">
            {/* Background gradient sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900" />

            {/* Stars/particles in background */}
            <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 60}%`,
                            opacity: Math.random() * 0.7 + 0.3,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Mountain SVG - Realistic silhouette */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 10 }}
            >
                <defs>
                    <linearGradient id="mountainGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4a5f7f" />
                        <stop offset="50%" stopColor="#2d3e50" />
                        <stop offset="100%" stopColor="#1a252f" />
                    </linearGradient>
                    <linearGradient id="snowGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.4" />
                    </linearGradient>
                </defs>

                {/* Main mountain shape */}
                <path
                    d="M 0,100 L 10,70 L 20,50 L 35,30 L 50,8 L 65,25 L 75,45 L 85,65 L 95,80 L 100,100 Z"
                    fill="url(#mountainGrad)"
                    stroke="#1e293b"
                    strokeWidth="0.5"
                />

                {/* Snow cap at peak */}
                <path
                    d="M 35,30 L 50,8 L 65,25 L 60,28 L 50,16 L 40,28 Z"
                    fill="url(#snowGrad)"
                />

                {/* Winding trail path */}
                <path
                    d="M 15,85 Q 20,75 25,70 Q 35,60 40,55 Q 45,45 48,40 Q 52,30 55,25 Q 60,18 65,15"
                    fill="none"
                    stroke="#E7C778"
                    strokeWidth="0.4"
                    strokeDasharray="2 2"
                    opacity="0.6"
                />
            </svg>

            {/* Peak flag */}
            <motion.div
                className="absolute z-30"
                style={{ left: '50%', top: '8%', transform: 'translateX(-50%)' }}
                animate={{
                    rotate: [-3, 3, -3],
                    y: [0, -2, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="text-5xl drop-shadow-lg">🚩</div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-brand-gold whitespace-nowrap drop-shadow-md">
                    GOAL
                </div>
            </motion.div>

            {/* Checkpoint markers along the path */}
            {pathPoints.map((point, index) => {
                const isCompleted = point.step.status === 'success'
                const isFailed = point.step.status === 'failed'
                const isInProgress = point.step.status === 'in-progress'

                return (
                    <motion.div
                        key={point.step.id}
                        className="absolute z-40 group cursor-pointer"
                        style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.15 }}
                        whileHover={{ scale: 1.4 }}
                    >
                        <div className="relative">
                            {/* Glow effect for completed */}
                            {isCompleted && (
                                <motion.div
                                    className="absolute inset-0 bg-brand-teal rounded-full blur-md"
                                    animate={{
                                        scale: [1, 1.6, 1],
                                        opacity: [0.5, 0.9, 0.5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}

                            {/* Checkpoint marker */}
                            <div className={`relative w-8 h-8 rounded-full border-3 flex items-center justify-center font-bold text-sm shadow-xl
                                ${isCompleted ? 'bg-brand-teal border-white text-white shadow-[0_0_25px_rgba(28,197,163,0.9)]' :
                                    isFailed ? 'bg-red-500 border-red-200 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                                        isInProgress ? 'bg-brand-gold border-white text-brand-blue animate-pulse shadow-[0_0_20px_rgba(231,199,120,0.8)]' :
                                            'bg-slate-700 border-slate-400 text-white'}`}
                            >
                                {isCompleted ? '✓' : index + 1}
                            </div>

                            {/* Sparkles for success */}
                            {isCompleted && (
                                <motion.div
                                    className="absolute -top-1 -right-1"
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.3, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="text-lg drop-shadow-lg">✨</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-black/95 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap shadow-2xl border border-white/20 backdrop-blur-sm">
                                <div className="font-bold mb-1">{point.step.title}</div>
                                <div className="text-white/70 text-xs">
                                    {isCompleted ? '✓ Completed' :
                                        isFailed ? '✗ Failed' :
                                            isInProgress ? '⏳ In Progress' : '○ Pending'}
                                </div>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-black/95 rotate-45 border-r border-b border-white/20" />
                        </div>
                    </motion.div>
                )
            })}

            {/* Climbing Avatar */}
            <motion.div
                className="absolute z-50"
                style={{
                    left: `${avatarX}%`,
                    top: `${avatarY}%`,
                    transform: 'translate(-50%, -50%)'
                }}
                animate={{
                    left: `${avatarX}%`,
                    top: `${avatarY}%`
                }}
                transition={{
                    type: "spring",
                    stiffness: 35,
                    damping: 12,
                    mass: 1.2
                }}
            >
                <div className="relative group">
                    {/* Glow aura */}
                    <motion.div
                        className="absolute -inset-2 bg-brand-gold rounded-full blur-2xl opacity-70"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />

                    {/* Avatar circle */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-brand-gold via-yellow-500 to-yellow-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                        {/* Animated climber emoji */}
                        <motion.div
                            className="text-4xl"
                            animate={{
                                y: [0, -3, 0],
                                rotate: [-8, 8, -8]
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            🧗
                        </motion.div>
                    </div>

                    {/* Progress badge */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-brand-blue border-2 border-brand-gold px-4 py-1.5 rounded-full text-sm font-bold text-brand-gold shadow-xl whitespace-nowrap">
                        {Math.round(progress)}% Complete
                    </div>

                    {/* Motivational tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-brand-blue px-4 py-2 rounded-xl text-sm font-bold shadow-2xl whitespace-nowrap">
                        Keep climbing! 🚀
                    </div>
                </div>
            </motion.div>

            {/* Elevation markers on the side */}
            <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-between py-16 text-white/40 text-sm font-mono z-20">
                {[100, 75, 50, 25, 0].map(elevation => (
                    <div key={elevation} className="flex items-center gap-3">
                        <div className="w-10 h-px bg-white/30" />
                        <span className="font-semibold">{elevation}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
