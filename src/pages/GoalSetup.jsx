import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMountain } from '../context/MountainContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { Rocket, DollarSign, Target, Smartphone, Zap, ChevronRight, Lock, Users, Hash, Percent } from 'lucide-react';

// Founder-specific journey templates with metric tracking
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
            metric_prefix: '$',
            metric_suffix: 'MRR',
            target_value: 10000
        },
        suggestedMilestones: [
            { target: 100, title: 'First $100!', commitment: 'No Netflix' },
            { target: 1000, title: '$1K MRR', commitment: 'No social media scrolling' },
            { target: 5000, title: 'Halfway!', commitment: 'No eating out' },
            { target: 10000, title: 'Summit: $10K MRR', reward: 'Weekend trip celebration' }
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
            metric_prefix: '$',
            metric_suffix: 'raised',
            target_value: 500000
        },
        suggestedMilestones: [
            { target: 50000, title: 'First $50K', commitment: 'No video games' },
            { target: 150000, title: '$150K Committed', commitment: 'Wake up at 6 AM' },
            { target: 300000, title: 'Halfway!', commitment: 'No unnecessary purchases' },
            { target: 500000, title: 'Round Complete!', reward: 'Team celebration dinner' }
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
            goal_target: '500 Upvotes',
            metric_prefix: '',
            metric_suffix: 'upvotes',
            target_value: 500
        },
        suggestedMilestones: [
            { target: 50, title: 'First 50 Upvotes', commitment: 'No distractions during launch' },
            { target: 150, title: 'Trending!', commitment: 'Stay engaged in comments' },
            { target: 300, title: 'Top 10!', commitment: 'No breaks until goal' },
            { target: 500, title: 'Top 5 Product!', reward: 'Launch party' }
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
            metric_prefix: '',
            metric_suffix: 'downloads',
            target_value: 1000
        },
        suggestedMilestones: [
            { target: 100, title: 'First 100 Downloads', commitment: 'No Netflix until 100' },
            { target: 300, title: '300 Users!', commitment: 'Ship daily updates' },
            { target: 600, title: 'Halfway!', commitment: 'No social media scrolling' },
            { target: 1000, title: '1K Downloads!', reward: 'Buy something nice' }
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
            metric_prefix: '$',
            metric_suffix: '',
            target_value: ''
        },
        suggestedMilestones: []
    }
];

const GoalSetup = () => {
    const navigate = useNavigate();
    const { addMountain, createMilestones } = useMountain();
    const { limits, isPro } = usePlanLimits();

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        mission_name: '',
        goal_target: '',
        metric_prefix: '$',
        metric_suffix: '',
        target_value: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Metric type presets
    const metricPresets = [
        { prefix: '$', suffix: '', label: 'Revenue', icon: DollarSign },
        { prefix: '', suffix: 'users', label: 'Users', icon: Users },
        { prefix: '', suffix: 'subscribers', label: 'Subscribers', icon: Users },
        { prefix: '', suffix: '%', label: 'Percentage', icon: Percent },
        { prefix: '', suffix: '', label: 'Custom', icon: Hash }
    ];

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        if (template.id !== 'custom') {
            setFormData({
                mission_name: template.defaults.mission_name,
                goal_target: template.defaults.goal_target,
                metric_prefix: template.defaults.metric_prefix,
                metric_suffix: template.defaults.metric_suffix,
                target_value: template.defaults.target_value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const targetVal = parseFloat(String(formData.target_value).replace(/,/g, ''));
        if (isNaN(targetVal) || targetVal <= 0) {
            setError('Please enter a valid target value');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await addMountain({
                title: formData.mission_name,
                target: formData.goal_target,
                target_value: targetVal,
                current_value: 0,
                metric_prefix: formData.metric_prefix,
                metric_suffix: formData.metric_suffix,
                total_steps_planned: selectedTemplate?.suggestedMilestones?.length || 4
            });

            if (result && result.success) {
                // If template has suggested milestones, create them
                if (selectedTemplate?.suggestedMilestones?.length > 0) {
                    const milestoneData = selectedTemplate.suggestedMilestones.map((m, i) => ({
                        target_value: m.target,
                        title: m.title,
                        commitment: m.commitment || '',
                        reward: m.reward || '',
                        icon_emoji: i === selectedTemplate.suggestedMilestones.length - 1 ? '🏆' : ['🌱', '🚀', '⛰️', '🔥'][i] || '🎯',
                        sort_order: i
                    }));
                    await createMilestones(milestoneData);
                }
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

    // Format number with commas
    const formatNumber = (value) => {
        const num = String(value).replace(/[^0-9.]/g, '');
        const parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
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
                                    <label className="block text-sm font-medium mb-2 text-brand-gold">Summit Goal (Display Name)</label>
                                    <input
                                        required
                                        value={formData.goal_target}
                                        onChange={e => setFormData({ ...formData, goal_target: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg"
                                        placeholder="e.g. $10,000 MRR"
                                    />
                                </div>

                                {/* Metric Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-brand-gold">
                                        Metric Type
                                    </label>
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {metricPresets.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    metric_prefix: preset.prefix,
                                                    metric_suffix: preset.suffix
                                                })}
                                                className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                                                    formData.metric_prefix === preset.prefix && formData.metric_suffix === preset.suffix
                                                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                <preset.icon size={16} />
                                                <span className="text-[10px]">{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom prefix/suffix */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Prefix</label>
                                            <input
                                                type="text"
                                                value={formData.metric_prefix}
                                                onChange={(e) => setFormData({ ...formData, metric_prefix: e.target.value })}
                                                placeholder="$"
                                                maxLength={5}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Suffix</label>
                                            <input
                                                type="text"
                                                value={formData.metric_suffix}
                                                onChange={(e) => setFormData({ ...formData, metric_suffix: e.target.value })}
                                                placeholder="MRR"
                                                maxLength={15}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Target Value */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-brand-gold">
                                        Target Value
                                    </label>
                                    <div className="relative">
                                        {formData.metric_prefix && (
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                                                {formData.metric_prefix}
                                            </span>
                                        )}
                                        <input
                                            required
                                            type="text"
                                            value={formatNumber(formData.target_value)}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                target_value: e.target.value.replace(/,/g, '')
                                            })}
                                            className={`w-full py-3 rounded-lg bg-black/20 border border-white/10 focus:border-brand-gold focus:outline-none text-lg ${
                                                formData.metric_prefix ? 'pl-8 pr-20' : 'px-4 pr-16'
                                            }`}
                                            placeholder="10,000"
                                        />
                                        {formData.metric_suffix && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                                                {formData.metric_suffix}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Preview */}
                                {formData.target_value && (
                                    <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3 text-center">
                                        <span className="text-white/60 text-sm">Your goal: </span>
                                        <span className="text-brand-gold font-bold">
                                            {formData.metric_prefix}{formatNumber(formData.target_value)} {formData.metric_suffix}
                                        </span>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue font-bold text-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    <Lock size={20} />
                                    {loading ? 'Creating your mountain...' : 'Lock In & Begin Climb'}
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

                            {/* Suggested Milestones with Lock-In */}
                            {selectedTemplate.suggestedMilestones && selectedTemplate.suggestedMilestones.length > 0 && (
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <h4 className="text-sm font-bold text-brand-gold mb-3 flex items-center gap-2">
                                        <Lock size={16} />
                                        Your Lock-In Milestones
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedTemplate.suggestedMilestones.map((milestone, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm">
                                                <span className="w-7 h-7 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0 text-sm">
                                                    {i === selectedTemplate.suggestedMilestones.length - 1 ? '🏆' : ['🌱', '🚀', '⛰️', '🔥'][i] || '🎯'}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">{milestone.title}</div>
                                                    <div className="text-xs text-brand-gold/70">
                                                        {formData.metric_prefix}{milestone.target?.toLocaleString()} {formData.metric_suffix}
                                                    </div>
                                                    {milestone.commitment && (
                                                        <div className="text-xs text-red-400/70 mt-0.5 flex items-center gap-1">
                                                            <Lock size={10} /> {milestone.commitment}
                                                        </div>
                                                    )}
                                                    {milestone.reward && (
                                                        <div className="text-xs text-green-400/70 mt-0.5">
                                                            🎁 {milestone.reward}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4">
                                        You can customize these milestones anytime from your dashboard
                                    </p>
                                </div>
                            )}

                            {/* Pro Tip */}
                            <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/20">
                                <p className="text-brand-gold text-sm font-medium mb-1">How Lock-In Works</p>
                                <p className="text-white/70 text-xs">
                                    Each milestone has a commitment (your "lock") and a reward (when you unlock).
                                    Track daily if you kept your promise. Stay accountable, celebrate wins!
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
