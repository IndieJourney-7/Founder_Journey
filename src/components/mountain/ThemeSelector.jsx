import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check, Sparkles, Star, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_CATEGORIES, getThemesByCategory } from '../../config/themes';

const ThemeSelector = ({ isOpen, onClose }) => {
    const { currentThemeId, setTheme, availableThemes } = useTheme();
    const [expandedCategory, setExpandedCategory] = useState('seasonal');

    const handleSelectTheme = (themeId) => {
        setTheme(themeId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                    <Palette className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Mountain Themes</h2>
                                    <p className="text-white/60 text-sm">Choose your journey's atmosphere</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Theme Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            {THEME_CATEGORIES.map((category) => {
                                const categoryThemes = getThemesByCategory(category.id);
                                if (categoryThemes.length === 0) return null;

                                return (
                                    <div key={category.id} className="space-y-3">
                                        {/* Category Header */}
                                        <button
                                            onClick={() => setExpandedCategory(
                                                expandedCategory === category.id ? null : category.id
                                            )}
                                            className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{category.name}</span>
                                                <span className="text-white/40 text-sm">({categoryThemes.length})</span>
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 text-white/40 transition-transform ${
                                                    expandedCategory === category.id ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {/* Themes Grid */}
                                        <AnimatePresence>
                                            {expandedCategory === category.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {categoryThemes.map((theme) => {
                                                            const isActive = currentThemeId === theme.id;

                                                            return (
                                                                <motion.button
                                                                    key={theme.id}
                                                                    onClick={() => handleSelectTheme(theme.id)}
                                                                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                                        isActive
                                                                            ? 'border-brand-teal bg-brand-teal/10'
                                                                            : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                                                                    }`}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                >
                                                                    {/* Theme Preview */}
                                                                    <div
                                                                        className="h-16 rounded-lg mb-3 overflow-hidden relative"
                                                                        style={{
                                                                            background: `linear-gradient(to bottom, ${theme.sky.from}, ${theme.sky.via || theme.sky.to}, ${theme.sky.to})`
                                                                        }}
                                                                    >
                                                                        {/* Mini mountain preview */}
                                                                        <svg
                                                                            viewBox="0 0 100 40"
                                                                            className="absolute bottom-0 w-full"
                                                                            preserveAspectRatio="none"
                                                                        >
                                                                            <path
                                                                                d="M0 40 L20 20 L40 30 L60 10 L80 25 L100 15 L100 40 Z"
                                                                                fill={theme.mountains.front.start}
                                                                                opacity="0.8"
                                                                            />
                                                                        </svg>

                                                                        {/* Particle preview dots */}
                                                                        {[...Array(8)].map((_, i) => (
                                                                            <motion.div
                                                                                key={i}
                                                                                className="absolute w-1 h-1 bg-white rounded-full"
                                                                                style={{
                                                                                    left: `${10 + i * 12}%`,
                                                                                    top: `${20 + Math.sin(i) * 20}%`,
                                                                                }}
                                                                                animate={{
                                                                                    opacity: [0.3, 0.8, 0.3],
                                                                                    scale: [0.8, 1.2, 0.8],
                                                                                }}
                                                                                transition={{
                                                                                    duration: 2,
                                                                                    repeat: Infinity,
                                                                                    delay: i * 0.2,
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </div>

                                                                    {/* Theme Info */}
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-semibold text-white">
                                                                                    {theme.name}
                                                                                </span>
                                                                                {theme.isSpecial && (
                                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-bold text-black rounded-full flex items-center gap-1">
                                                                                        <Sparkles className="w-3 h-3" />
                                                                                        {theme.badge || 'SPECIAL'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-white/50 text-sm mt-1">
                                                                                {theme.description}
                                                                            </p>
                                                                        </div>

                                                                        {isActive && (
                                                                            <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center">
                                                                                <Check className="w-4 h-4 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                    <Star className="w-4 h-4" />
                                    <span>More themes coming soon!</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-brand-teal hover:bg-brand-teal/80 text-white rounded-lg font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Floating Theme Toggle Button
export const ThemeToggleButton = ({ onClick }) => {
    const { currentTheme } = useTheme();

    return (
        <motion.button
            onClick={onClick}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 p-3 md:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Change Theme"
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-6 h-6 rounded-full border-2 border-white/30"
                    style={{
                        background: `linear-gradient(135deg, ${currentTheme.sky.from}, ${currentTheme.sky.to})`
                    }}
                />
                <span className="hidden md:block text-white/80 text-sm font-medium group-hover:text-white">
                    {currentTheme.name.split(' ')[0]}
                </span>
                <Palette className="w-4 h-4 text-white/60 group-hover:text-white hidden md:block" />
            </div>
        </motion.button>
    );
};

export default ThemeSelector;
