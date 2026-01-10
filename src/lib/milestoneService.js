/**
 * Milestone Service
 *
 * Handles all lock milestone-related database operations.
 * Supports the Lock-In Commitment system.
 */

import { supabase } from './supabase';
import { logger } from './logger';

// ============ MILESTONES ============

/**
 * Fetch all milestones for a mountain
 */
export const fetchMilestones = async (mountainId) => {
    if (!mountainId) {
        return { milestones: [], error: { message: 'Mountain ID required' } }
    }

    const { data, error } = await supabase
        .from('lock_milestones')
        .select('*')
        .eq('mountain_id', mountainId)
        .order('target_value', { ascending: true })

    if (error) {
        console.error('Error fetching milestones:', error.message)
        return { milestones: [], error }
    }

    return { milestones: data || [], error: null }
}

/**
 * Create a new milestone
 */
export const createMilestone = async (mountainId, userId, milestoneData) => {
    if (!mountainId || !userId) {
        return { milestone: null, error: { message: 'Mountain ID and User ID required' } }
    }

    const { data, error } = await supabase
        .from('lock_milestones')
        .insert([{
            mountain_id: mountainId,
            user_id: userId,
            target_value: milestoneData.target_value,
            title: milestoneData.title,
            commitment: milestoneData.commitment || null,
            reward: milestoneData.reward || null,
            icon_emoji: milestoneData.icon_emoji || '🎯',
            theme_color: milestoneData.theme_color || '#E7C778',
            sort_order: milestoneData.sort_order || 0
        }])
        .select()
        .single()

    if (error) {
        console.error('Error creating milestone:', error.message)
        return { milestone: null, error }
    }

    logger.log('Milestone created:', data)
    return { milestone: data, error: null }
}

/**
 * Create multiple milestones at once
 */
export const createMilestonesBatch = async (mountainId, userId, milestonesData) => {
    if (!mountainId || !userId) {
        return { milestones: [], error: { message: 'Mountain ID and User ID required' } }
    }

    const milestonesToInsert = milestonesData.map((m, index) => ({
        mountain_id: mountainId,
        user_id: userId,
        target_value: m.target_value,
        title: m.title,
        commitment: m.commitment || null,
        reward: m.reward || null,
        icon_emoji: m.icon_emoji || '🎯',
        theme_color: m.theme_color || '#E7C778',
        sort_order: m.sort_order ?? index
    }))

    const { data, error } = await supabase
        .from('lock_milestones')
        .insert(milestonesToInsert)
        .select()

    if (error) {
        console.error('Error creating milestones:', error.message)
        return { milestones: [], error }
    }

    return { milestones: data || [], error: null }
}

/**
 * Update a milestone
 */
export const updateMilestone = async (milestoneId, updates) => {
    const { data, error } = await supabase
        .from('lock_milestones')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single()

    if (error) {
        console.error('Error updating milestone:', error.message)
        return { milestone: null, error }
    }

    return { milestone: data, error: null }
}

/**
 * Delete a milestone
 */
export const deleteMilestone = async (milestoneId) => {
    const { error } = await supabase
        .from('lock_milestones')
        .delete()
        .eq('id', milestoneId)

    if (error) {
        console.error('Error deleting milestone:', error.message)
        return { success: false, error }
    }

    return { success: true, error: null }
}

/**
 * Manually unlock a milestone
 */
export const unlockMilestone = async (milestoneId, currentValue) => {
    const { data, error } = await supabase
        .from('lock_milestones')
        .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
            unlocked_value: currentValue,
            updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single()

    if (error) {
        console.error('Error unlocking milestone:', error.message)
        return { milestone: null, error }
    }

    return { milestone: data, error: null }
}

// ============ DAILY CHECK-INS ============

/**
 * Fetch check-ins for a milestone
 */
export const fetchCheckins = async (milestoneId) => {
    const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('milestone_id', milestoneId)
        .order('checkin_date', { ascending: false })

    if (error) {
        console.error('Error fetching check-ins:', error.message)
        return { checkins: [], error }
    }

    return { checkins: data || [], error: null }
}

/**
 * Create or update a daily check-in
 */
export const upsertCheckin = async (milestoneId, userId, date, keptPromise, note = null) => {
    const { data, error } = await supabase
        .from('daily_checkins')
        .upsert({
            milestone_id: milestoneId,
            user_id: userId,
            checkin_date: date,
            kept_promise: keptPromise,
            note: note
        }, {
            onConflict: 'milestone_id,checkin_date'
        })
        .select()
        .single()

    if (error) {
        console.error('Error upserting check-in:', error.message)
        return { checkin: null, error }
    }

    return { checkin: data, error: null }
}

/**
 * Get streak stats for a milestone
 */
export const getMilestoneStreak = async (milestoneId) => {
    const { data, error } = await supabase
        .rpc('get_milestone_streak', { milestone_uuid: milestoneId })

    if (error) {
        console.error('Error getting streak:', error.message)
        // Return default values on error
        return {
            stats: {
                current_streak: 0,
                longest_streak: 0,
                total_days: 0,
                kept_days: 0,
                commitment_rate: 0
            },
            error
        }
    }

    return { stats: data?.[0] || { current_streak: 0, longest_streak: 0, total_days: 0, kept_days: 0, commitment_rate: 0 }, error: null }
}

// ============ WATCHERS ============

/**
 * Add a watcher to a milestone
 */
export const addWatcher = async (milestoneId, mountainId, watcherName, watcherEmail = null) => {
    const { data, error } = await supabase
        .from('milestone_watchers')
        .insert([{
            milestone_id: milestoneId,
            mountain_id: mountainId,
            watcher_name: watcherName,
            watcher_email: watcherEmail
        }])
        .select()
        .single()

    if (error) {
        // Ignore duplicate errors
        if (error.code === '23505') {
            return { watcher: null, error: null, alreadyWatching: true }
        }
        console.error('Error adding watcher:', error.message)
        return { watcher: null, error }
    }

    return { watcher: data, error: null }
}

/**
 * Get watcher count for a milestone
 */
export const getWatcherCount = async (milestoneId) => {
    const { count, error } = await supabase
        .from('milestone_watchers')
        .select('*', { count: 'exact', head: true })
        .eq('milestone_id', milestoneId)

    if (error) {
        console.error('Error getting watcher count:', error.message)
        return { count: 0, error }
    }

    return { count: count || 0, error: null }
}

// ============ HELPERS ============

/**
 * Generate default milestones for a target value
 */
export const generateDefaultMilestones = (targetValue) => {
    const milestones = [
        { percent: 10, title: 'First 10%!', icon: '🌱', commitment: '' },
        { percent: 25, title: 'Quarter Way!', icon: '🚀', commitment: '' },
        { percent: 50, title: 'Halfway Point!', icon: '⛰️', commitment: '' },
        { percent: 75, title: 'Almost There!', icon: '🔥', commitment: '' },
        { percent: 100, title: 'Summit Reached!', icon: '🏆', commitment: '' }
    ]

    return milestones.map((m, index) => ({
        target_value: Math.round((m.percent / 100) * targetValue),
        title: m.title,
        icon_emoji: m.icon,
        commitment: m.commitment,
        reward: '',
        sort_order: index
    }))
}

/**
 * Commitment preset suggestions
 */
export const COMMITMENT_PRESETS = [
    { label: 'No Netflix/streaming', icon: '📺' },
    { label: 'No social media scrolling', icon: '📱' },
    { label: 'No eating out', icon: '🍔' },
    { label: 'No unnecessary purchases', icon: '💳' },
    { label: 'No video games', icon: '🎮' },
    { label: 'No alcohol', icon: '🍺' },
    { label: 'No snacking', icon: '🍪' },
    { label: 'Wake up before 6 AM', icon: '⏰' }
]

/**
 * Reward preset suggestions
 */
export const REWARD_PRESETS = [
    { label: 'Nice dinner out', icon: '🍽️' },
    { label: 'Buy something I want', icon: '🛍️' },
    { label: 'Day off', icon: '🏖️' },
    { label: 'Movie night', icon: '🎬' },
    { label: 'Spa/massage', icon: '💆' },
    { label: 'New gear/gadget', icon: '🎧' },
    { label: 'Weekend trip', icon: '✈️' },
    { label: 'Celebrate with friends', icon: '🎉' }
]
