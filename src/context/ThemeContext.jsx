import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ANIMATED_THEMES, DEFAULT_THEME_ID, getTheme } from '../config/themes';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'shift_journey_theme';

export function ThemeProvider({ children }) {
    const [currentThemeId, setCurrentThemeId] = useState(DEFAULT_THEME_ID);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme from localStorage on mount
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem(STORAGE_KEY);
            if (savedTheme && ANIMATED_THEMES[savedTheme]) {
                setCurrentThemeId(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save theme to localStorage when changed
    const setTheme = useCallback((themeId) => {
        if (ANIMATED_THEMES[themeId]) {
            setCurrentThemeId(themeId);
            try {
                localStorage.setItem(STORAGE_KEY, themeId);
            } catch (error) {
                console.error('Error saving theme:', error);
            }
        }
    }, []);

    // Get current theme object
    const currentTheme = getTheme(currentThemeId);

    // Check if a theme is active
    const isThemeActive = useCallback((themeId) => {
        return currentThemeId === themeId;
    }, [currentThemeId]);

    // Get all available themes
    const availableThemes = Object.values(ANIMATED_THEMES);

    // Cycle to next theme (useful for quick testing)
    const cycleTheme = useCallback(() => {
        const themeIds = Object.keys(ANIMATED_THEMES);
        const currentIndex = themeIds.indexOf(currentThemeId);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        setTheme(themeIds[nextIndex]);
    }, [currentThemeId, setTheme]);

    const value = {
        currentThemeId,
        currentTheme,
        setTheme,
        isThemeActive,
        availableThemes,
        cycleTheme,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
