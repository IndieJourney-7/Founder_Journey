/**
 * Public Profile Service
 *
 * Handles username claiming, public profile settings,
 * and encouragement/reaction system.
 */

import { supabase } from './supabase';

// Emoji options for encouragements
export const ENCOURAGEMENT_EMOJIS = {
    fire: { emoji: '🔥', label: 'Fire', color: '#f97316' },
    muscle: { emoji: '💪', label: 'Strong', color: '#eab308' },
    rocket: { emoji: '🚀', label: 'Launch', color: '#3b82f6' },
    star: { emoji: '⭐', label: 'Star', color: '#fbbf24' },
    clap: { emoji: '👏', label: 'Applause', color: '#f472b6' },
    heart: { emoji: '❤️', label: 'Love', color: '#ef4444' },
    trophy: { emoji: '🏆', label: 'Champion', color: '#d97706' },
    lightning: { emoji: '⚡', label: 'Energy', color: '#8b5cf6' }
};

/**
 * Validate username format
 * @param {string} username
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateUsername = (username) => {
    if (!username) {
        return { valid: false, error: 'Username is required' };
    }

    const normalized = username.toLowerCase().trim();

    if (normalized.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (normalized.length > 20) {
        return { valid: false, error: 'Username must be 20 characters or less' };
    }

    if (!/^[a-z]/.test(normalized)) {
        return { valid: false, error: 'Username must start with a letter' };
    }

    if (!/^[a-z][a-z0-9_]*$/.test(normalized)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    // Reserved usernames
    const reserved = ['admin', 'support', 'help', 'shift', 'ascent', 'api', 'www', 'app', 'dashboard', 'settings', 'profile', 'login', 'signup', 'auth'];
    if (reserved.includes(normalized)) {
        return { valid: false, error: 'This username is reserved' };
    }

    return { valid: true };
};

/**
 * Check if a username is available
 * @param {string} username
 * @returns {Promise<{ available: boolean, error?: string }>}
 */
export const checkUsernameAvailable = async (username) => {
    const validation = validateUsername(username);
    if (!validation.valid) {
        return { available: false, error: validation.error };
    }

    const normalized = username.toLowerCase().trim();

    try {
        const { data, error } = await supabase
            .from('mountains')
            .select('username')
            .eq('username', normalized)
            .maybeSingle();

        if (error) {
            console.error('Error checking username:', error);
            return { available: false, error: 'Could not check username availability' };
        }

        return { available: !data, error: null };
    } catch (err) {
        console.error('Error checking username:', err);
        return { available: false, error: 'Could not check username availability' };
    }
};

/**
 * Claim a username for a mountain
 * @param {string} mountainId
 * @param {string} username
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const claimUsername = async (mountainId, username) => {
    const validation = validateUsername(username);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    const normalized = username.toLowerCase().trim();

    try {
        const { data, error } = await supabase
            .from('mountains')
            .update({ username: normalized })
            .eq('id', mountainId)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'This username is already taken' };
            }
            console.error('Error claiming username:', error);
            return { success: false, error: error.message || 'Could not claim username' };
        }

        return { success: true, mountain: data };
    } catch (err) {
        console.error('Error claiming username:', err);
        return { success: false, error: 'Could not claim username' };
    }
};

/**
 * Update public profile settings
 * @param {string} mountainId
 * @param {object} settings - { is_public, public_bio }
 * @returns {Promise<{ success: boolean, mountain?: object, error?: string }>}
 */
export const updatePublicSettings = async (mountainId, settings) => {
    try {
        const { data, error } = await supabase
            .from('mountains')
            .update({
                is_public: settings.is_public,
                public_bio: settings.public_bio
            })
            .eq('id', mountainId)
            .select()
            .single();

        if (error) {
            console.error('Error updating public settings:', error);
            return { success: false, error: error.message };
        }

        return { success: true, mountain: data };
    } catch (err) {
        console.error('Error updating public settings:', err);
        return { success: false, error: 'Could not update settings' };
    }
};

/**
 * Fetch a public mountain by username
 * @param {string} username
 * @returns {Promise<{ mountain?: object, steps?: array, notes?: array, error?: string }>}
 */
export const fetchPublicMountain = async (username) => {
    const normalized = username.toLowerCase().trim();

    try {
        // Fetch the mountain
        const { data: mountain, error: mountainError } = await supabase
            .from('mountains')
            .select('*')
            .eq('username', normalized)
            .eq('is_public', true)
            .maybeSingle();

        if (mountainError) {
            console.error('Error fetching public mountain:', mountainError);
            return { error: 'Could not load profile' };
        }

        if (!mountain) {
            return { error: 'Profile not found or is private' };
        }

        // Fetch steps for this mountain
        const { data: steps, error: stepsError } = await supabase
            .from('steps')
            .select('*')
            .eq('mountain_id', mountain.id)
            .order('order_index', { ascending: true });

        if (stepsError) {
            console.error('Error fetching steps:', stepsError);
        }

        // Fetch journey notes for these steps
        let notes = [];
        if (steps && steps.length > 0) {
            const stepIds = steps.map(s => s.id);
            const { data: notesData, error: notesError } = await supabase
                .from('journey_notes')
                .select('*')
                .in('step_id', stepIds)
                .order('created_at', { ascending: false });

            if (notesError) {
                console.error('Error fetching notes:', notesError);
            } else {
                notes = notesData || [];
            }
        }

        return {
            mountain,
            steps: steps || [],
            notes,
            error: null
        };
    } catch (err) {
        console.error('Error fetching public mountain:', err);
        return { error: 'Could not load profile' };
    }
};

/**
 * Send an encouragement to a public mountain
 * @param {string} mountainId
 * @param {string} emoji - One of the ENCOURAGEMENT_EMOJIS keys
 * @param {string} [senderName] - Optional sender name
 * @param {string} [message] - Optional short message
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendEncouragement = async (mountainId, emoji, senderName = null, message = null) => {
    if (!ENCOURAGEMENT_EMOJIS[emoji]) {
        return { success: false, error: 'Invalid emoji' };
    }

    // Basic message validation
    if (message && message.length > 140) {
        return { success: false, error: 'Message must be 140 characters or less' };
    }

    if (senderName && senderName.length > 50) {
        return { success: false, error: 'Name must be 50 characters or less' };
    }

    try {
        const { error } = await supabase
            .from('encouragements')
            .insert({
                mountain_id: mountainId,
                emoji,
                sender_name: senderName?.trim() || null,
                message: message?.trim() || null
            });

        if (error) {
            console.error('Error sending encouragement:', error);
            return { success: false, error: 'Could not send encouragement' };
        }

        return { success: true };
    } catch (err) {
        console.error('Error sending encouragement:', err);
        return { success: false, error: 'Could not send encouragement' };
    }
};

/**
 * Fetch encouragements for a mountain
 * @param {string} mountainId
 * @param {number} [limit=50]
 * @returns {Promise<{ encouragements?: array, error?: string }>}
 */
export const fetchEncouragements = async (mountainId, limit = 50) => {
    try {
        const { data, error } = await supabase
            .from('encouragements')
            .select('*')
            .eq('mountain_id', mountainId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching encouragements:', error);
            return { error: 'Could not load encouragements' };
        }

        return { encouragements: data || [] };
    } catch (err) {
        console.error('Error fetching encouragements:', err);
        return { error: 'Could not load encouragements' };
    }
};

/**
 * Get encouragement stats for a mountain
 * @param {string} mountainId
 * @returns {Promise<{ stats?: object, error?: string }>}
 */
export const getEncouragementStats = async (mountainId) => {
    try {
        const { data, error } = await supabase
            .from('encouragements')
            .select('emoji')
            .eq('mountain_id', mountainId);

        if (error) {
            console.error('Error fetching encouragement stats:', error);
            return { error: 'Could not load stats' };
        }

        // Count by emoji type
        const stats = {};
        (data || []).forEach(({ emoji }) => {
            stats[emoji] = (stats[emoji] || 0) + 1;
        });

        return { stats };
    } catch (err) {
        console.error('Error fetching encouragement stats:', err);
        return { error: 'Could not load stats' };
    }
};
