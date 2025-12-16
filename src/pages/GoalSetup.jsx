import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMountain } from '../context/MountainContext';
import { usePlanLimits } from '../hooks/usePlanLimits';

// MVP: Only one mountain type allowed
const DEFAULT_MOUNTAIN_TYPE = {
    id: 'startup',
    name: 'Startup Journey',
    color: 'from-[#0F1F3D] to-[#4E6ED0]',
    description: 'For founders building the next big thing.'
};

const GoalSetup = () => {
    const navigate = useNavigate();
    const { addMountain } = useMountain();
    const { limits, isPro } = usePlanLimits();
    const [formData, setFormData] = useState({
        mission_name: '',
        goal_target: '',
        total_steps_planned: 6
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // LIMIT CHECK
        if (parseInt(formData.total_steps_planned) > limits.maxStepsPerMountain) {
            setError(`On the Free plan, you can only plan up to ${limits.maxStepsPerMountain} steps. Upgrade to Pro for unlimited steps!`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await addMountain({
                title: formData.mission_name,
                target: formData.goal_target,
                total_steps_planned: parseInt(formData.total_steps_planned) || 6
            });

            if (result && result.success) {
                navigate('/dashboard');
            } else {
                setError(result?.error?.message || 'Failed to create mountain. Please try again.');
            }
        } catch (err) {
            console.error("Failed to create mountain", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1F3D] text-white pt-20 pb-10 px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Start Your Ascent</h1>
                        <p className="text-slate-400">Define your mission and plan your journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-brand-gold">Mission Name</label>
                            <input
                                required
                                value={formData.mission_name}
                                onChange={e => setFormData({ ...formData, mission_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg"
                                placeholder="e.g. Operation 10K"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-brand-gold">Summit Goal</label>
                            <input
                                required
                                value={formData.goal_target}
                                onChange={e => setFormData({ ...formData, goal_target: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg"
                                placeholder="e.g. $10,000 MRR"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-brand-gold">
                                Total Steps Planned
                            </label>
                            <p className="text-xs text-white/50 mb-2">
                                How many strategy experiments do you plan to run?
                                {!isPro && <span className="text-brand-gold ml-1">(Free limit: {limits.maxStepsPerMountain})</span>}
                            </p>
                            <input
                                required
                                type="number"
                                min="1"
                                max={limits.maxStepsPerMountain} // Enforce max attribute
                                value={formData.total_steps_planned}
                                onChange={e => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = "";

                                    // Clamp value for free users
                                    if (!isPro && val > limits.maxStepsPerMountain) {
                                        val = limits.maxStepsPerMountain;
                                    }
                                    setFormData({ ...formData, total_steps_planned: val })
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg"
                                placeholder="6"
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold text-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Creating your mountain...' : 'Begin Climb 🚀'}
                        </button>
                    </form>
                </motion.div>

                {/* Preview Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl"
                >
                    {/* Default Theme Background */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${DEFAULT_MOUNTAIN_TYPE.color}`} />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center z-10 p-6">
                            <div className="text-6xl mb-4">🏔️</div>
                            <h3 className="text-2xl font-bold text-white mb-2">{formData.mission_name || 'Your Mission'}</h3>
                            <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-2">
                                Target: {formData.goal_target || 'Your Goal'}
                            </div>
                            <div className="text-xs text-white/60">
                                {formData.total_steps_planned} steps planned
                            </div>
                        </div>
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>

            </div>
        </div>
    );
};

export default GoalSetup;
