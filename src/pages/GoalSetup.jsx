import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMountain } from '../context/MountainContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { Rocket, DollarSign, Target, Smartphone, Zap, ChevronRight } from 'lucide-react';

// Founder-specific journey templates
const JOURNEY_TEMPLATES = [
    {
        id: 'saas_mrr',
        name: 'SaaS: $0 → $10K MRR',
        icon: Rocket,
        color: 'from-purple-500 to-pink-500',
        description: 'The classic indie hacker journey',
        defaults: {
            mission_name: '$10K MRR Journey',
            goal_target: '$10,000 MRR',
            total_steps_planned: 6
        },
        suggestedSteps: [
            'Validate problem with 10 user interviews',
            'Build MVP in 2 weeks',
            'Get first 10 beta users',
            'Launch on Product Hunt',
            'Reach $1K MRR',
            'Scale to $10K MRR'
        ]
    },
    {
        id: 'fundraising',
        name: 'Fundraising: Pre-seed',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        description: 'From idea to funded startup',
        defaults: {
            mission_name: 'Pre-seed Raise',
            goal_target: '$500K Pre-seed',
            total_steps_planned: 6
        },
        suggestedSteps: [
            'Build pitch deck v1',
            'Get warm intros to 20 investors',
            'First 10 pitch meetings',
            'Receive first term sheet',
            'Close lead investor',
            'Complete round'
        ]
    },
    {
        id: 'product_hunt',
        name: 'Product Hunt Launch',
        icon: Target,
        color: 'from-orange-500 to-red-500',
        description: 'Prep for launch day success',
        defaults: {
            mission_name: 'PH Launch Day',
            goal_target: 'Top 5 Product of the Day',
            total_steps_planned: 6
        },
        suggestedSteps: [
            'Finish product polish',
            'Create launch assets (video, images)',
            'Build hunter network & get featured',
            'Prep launch day community',
            'Launch & engage comments',
            'Post-launch momentum'
        ]
    },
    {
        id: 'app_launch',
        name: 'App: Idea → App Store',
        icon: Smartphone,
        color: 'from-blue-500 to-cyan-500',
        description: 'Ship your mobile app',
        defaults: {
            mission_name: 'App Store Launch',
            goal_target: '1,000 Downloads',
            total_steps_planned: 6
        },
        suggestedSteps: [
            'Validate app idea',
            'Design UI/UX mockups',
            'Build core features',
            'Beta test with 50 users',
            'Submit to App Store',
            'Reach 1K downloads'
        ]
    },
    {
        id: 'custom',
        name: 'Custom Journey',
        icon: Zap,
        color: 'from-brand-gold to-yellow-500',
        description: 'Define your own path',
        defaults: {
            mission_name: '',
            goal_target: '',
            total_steps_planned: 6
        },
        suggestedSteps: []
    }
];

const GoalSetup = () => {
    const navigate = useNavigate();
    const { addMountain } = useMountain();
    const { limits, isPro } = usePlanLimits();

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        mission_name: '',
        goal_target: '',
        total_steps_planned: 6
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        if (template.id !== 'custom') {
            setFormData({
                mission_name: template.defaults.mission_name,
                goal_target: template.defaults.goal_target,
                total_steps_planned: template.defaults.total_steps_planned
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">Start Your Ascent</h1>
                    <p className="text-slate-400 text-lg">Pick a journey template or create your own</p>
                </motion.div>

                {/* Template Selection */}
                {!selectedTemplate ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                    >
                        {JOURNEY_TEMPLATES.map((template, i) => {
                            const Icon = template.icon;
                            return (
                                <motion.button
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/50 transition-all text-left group hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-gold/10"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                                    <p className="text-sm text-slate-400">{template.description}</p>

                                    {template.id !== 'custom' && (
                                        <div className="mt-4 flex items-center gap-2 text-brand-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Use this template</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 items-start">

                        {/* Form Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                            >
                                <ChevronRight size={16} className="rotate-180" />
                                Choose different template
                            </button>

                            {/* Selected Template Badge */}
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTemplate.color} flex items-center justify-center`}>
                                    <selectedTemplate.icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{selectedTemplate.name}</p>
                                    <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                                </div>
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
                                        How many milestones to reach your goal?
                                        {!isPro && <span className="text-brand-gold ml-1">(Free limit: {limits.maxStepsPerMountain})</span>}
                                    </p>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max={limits.maxStepsPerMountain}
                                        value={formData.total_steps_planned}
                                        onChange={e => {
                                            let val = parseInt(e.target.value);
                                            if (isNaN(val)) val = "";
                                            if (!isPro && val > limits.maxStepsPerMountain) {
                                                val = limits.maxStepsPerMountain;
                                            }
                                            setFormData({ ...formData, total_steps_planned: val })
                                        }}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg"
                                        placeholder="6"
                                    />
                                </div>

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

                        {/* Preview & Tips Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Live Preview */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                <div className={`absolute inset-0 bg-gradient-to-b from-[#0F1F3D] to-[#4E6ED0]`} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center z-10 p-6">
                                        <div className="text-6xl mb-4">🏔️</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{formData.mission_name || 'Your Mission'}</h3>
                                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-2">
                                            Target: {formData.goal_target || 'Your Goal'}
                                        </div>
                                        <div className="text-xs text-white/60">
                                            {formData.total_steps_planned} milestones planned
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Suggested Steps */}
                            {selectedTemplate.suggestedSteps.length > 0 && (
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <h4 className="text-sm font-bold text-brand-gold mb-3 flex items-center gap-2">
                                        <Target size={16} />
                                        Suggested Milestones
                                    </h4>
                                    <ol className="space-y-2">
                                        {selectedTemplate.suggestedSteps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                                    {i + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                    <p className="text-xs text-slate-500 mt-4">
                                        You'll add your actual steps after creating the journey
                                    </p>
                                </div>
                            )}

                            {/* Pro Tip */}
                            <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/20">
                                <p className="text-brand-gold text-sm font-medium mb-1">Pro Tip</p>
                                <p className="text-white/70 text-xs">
                                    Start small. 6 milestones is perfect. You can always add more as you progress. The goal is to share wins early and often.
                                </p>
                            </div>
                        </motion.div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default GoalSetup;
