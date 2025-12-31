import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Mountain,
    Search,
    Trophy,
    Heart,
    TrendingUp,
    Star,
    Sparkles,
    Users,
    ArrowRight,
    Filter
} from 'lucide-react'
import { fetchPublicJourneys, ENCOURAGEMENT_EMOJIS } from '../lib/publicProfileService'
import MountainBackground from '../components/mountain/MountainBackground'
import SEO, { getDiscoverPageSEO } from '../components/SEO'

// Journey Card Component
const JourneyCard = ({ journey, index, featured = false }) => {
    const progress = journey.progress || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/climb/@${journey.username}`}
                className={`block p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-xl ${
                    featured
                        ? 'bg-gradient-to-br from-brand-gold/10 to-yellow-500/5 border-brand-gold/30 hover:border-brand-gold/50'
                        : 'bg-[#0F1F3D]/80 border-white/10 hover:border-white/20'
                }`}
            >
                {/* Featured Badge */}
                {featured && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-4 h-4 text-brand-gold" />
                        <span className="text-xs font-bold text-brand-gold">FEATURED</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center text-brand-blue text-lg font-bold shrink-0">
                        {journey.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">@{journey.username}</p>
                        <p className="text-sm text-white/50 truncate">{journey.title}</p>
                    </div>
                </div>

                {/* Target */}
                {journey.target && (
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">{journey.target}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">Progress</span>
                        <span className="font-bold text-brand-teal">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-brand-teal to-brand-gold"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-white/40">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span>{journey.encouragement_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-teal">
                        <span className="text-xs">View Journey</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// Empty State
const EmptyState = () => (
    <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <Users className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No public journeys yet</h3>
        <p className="text-white/50 mb-6 max-w-md mx-auto">
            Be the first to share your journey with the community!
        </p>
        <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
            <Mountain className="w-5 h-5" />
            Start Your Journey
        </Link>
    </div>
);

export default function Discover() {
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'featured', 'trending'
    const [searchQuery, setSearchQuery] = useState('');

    // Load journeys
    useEffect(() => {
        const loadJourneys = async () => {
            setLoading(true);
            const result = await fetchPublicJourneys({
                featuredOnly: filter === 'featured',
                limit: 50
            });

            if (!result.error) {
                setJourneys(result.journeys || []);
            }
            setLoading(false);
        };

        loadJourneys();
    }, [filter]);

    // Filter journeys by search
    const filteredJourneys = journeys.filter(j => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            j.username?.toLowerCase().includes(query) ||
            j.title?.toLowerCase().includes(query) ||
            j.target?.toLowerCase().includes(query)
        );
    });

    // Sort for trending (by encouragement count)
    const displayJourneys = filter === 'trending'
        ? [...filteredJourneys].sort((a, b) => (b.encouragement_count || 0) - (a.encouragement_count || 0))
        : filteredJourneys;

    // Separate featured and regular
    const featuredJourneys = displayJourneys.filter(j => j.is_featured);
    const regularJourneys = displayJourneys.filter(j => !j.is_featured);

    return (
        <div className="min-h-screen bg-brand-blue relative overflow-hidden">
            {/* SEO Meta Tags */}
            <SEO {...getDiscoverPageSEO()} />

            {/* Mountain Background */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <MountainBackground progress={50} height="100vh" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="p-4 border-b border-white/10 backdrop-blur-sm bg-brand-blue/60">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link
                            to="/"
                            className="text-xl font-bold text-brand-gold tracking-tighter flex items-center gap-2"
                        >
                            <Mountain className="w-6 h-6" />
                            SHIFT ASCENT
                        </Link>
                        <Link
                            to="/auth"
                            className="px-4 py-2 bg-brand-gold text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                        >
                            Start Journey
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="py-12 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-brand-gold" />
                            <span className="text-sm text-brand-gold font-medium">Community Journeys</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Discover Inspiring<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-gold">
                                Journeys
                            </span>
                        </h1>
                        <p className="text-white/60 max-w-2xl mx-auto mb-8">
                            Explore public mountains from our community. Get inspired, send encouragement, and find your own path to the summit.
                        </p>
                    </motion.div>
                </section>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto px-4 pb-16">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search journeys..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-brand-teal focus:outline-none"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'All', icon: Users },
                                { key: 'featured', label: 'Featured', icon: Star },
                                { key: 'trending', label: 'Trending', icon: TrendingUp }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                        filter === key
                                            ? 'bg-white/10 border-white/20 text-white'
                                            : 'border-white/5 text-white/50 hover:text-white hover:border-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Mountain className="w-12 h-12 text-brand-gold" />
                            </motion.div>
                        </div>
                    ) : displayJourneys.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* Featured Journeys Section */}
                            {filter !== 'featured' && featuredJourneys.length > 0 && (
                                <section className="mb-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Star className="w-5 h-5 text-brand-gold" />
                                        <h2 className="text-xl font-bold text-white">Featured Journeys</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {featuredJourneys.slice(0, 3).map((journey, index) => (
                                            <JourneyCard
                                                key={journey.id}
                                                journey={journey}
                                                index={index}
                                                featured={true}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* All Journeys */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <Mountain className="w-5 h-5 text-brand-teal" />
                                    <h2 className="text-xl font-bold text-white">
                                        {filter === 'featured' ? 'Featured' : filter === 'trending' ? 'Trending' : 'All'} Journeys
                                    </h2>
                                    <span className="text-white/40 text-sm">({displayJourneys.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(filter === 'featured' ? featuredJourneys : regularJourneys).map((journey, index) => (
                                        <JourneyCard
                                            key={journey.id}
                                            journey={journey}
                                            index={index}
                                            featured={filter === 'featured'}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Stats Footer */}
                            <section className="mt-16 text-center">
                                <div className="inline-flex items-center gap-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                    <div>
                                        <p className="text-3xl font-bold text-brand-gold">{journeys.length}</p>
                                        <p className="text-xs text-white/50">Public Journeys</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div>
                                        <p className="text-3xl font-bold text-brand-teal">
                                            {journeys.reduce((sum, j) => sum + (j.encouragement_count || 0), 0)}
                                        </p>
                                        <p className="text-xs text-white/50">Encouragements</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {Math.round(journeys.reduce((sum, j) => sum + (j.progress || 0), 0) / Math.max(journeys.length, 1))}%
                                        </p>
                                        <p className="text-xs text-white/50">Avg Progress</p>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                {/* CTA Section */}
                <section className="py-12 px-4 bg-gradient-to-b from-transparent to-black/20 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to share your journey?</h3>
                    <p className="text-white/60 mb-6">
                        Make your mountain public and inspire others on their climb.
                    </p>
                    <Link
                        to="/auth"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-blue font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
                    >
                        <Mountain className="w-5 h-5" />
                        Begin Your Ascent
                    </Link>
                </section>
            </div>
        </div>
    );
}
