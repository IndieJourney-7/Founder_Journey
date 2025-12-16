/**
 * Mountain Service
 * 
 * Handles all mountain-related database operations.
 * 
 * Schema: mountains (id uuid, user_id uuid, title text, target text, created_at)
 * MVP Rule: One mountain per user (enforced in code)
 */

import { supabase } from './supabase'

/**
 * Fetch the current user's mountain
 * @param {string} userId 
 * @returns {Promise<{mountain: object|null, error: object|null}>}
 */
export const fetchUserMountain = async (userId) => {
    if (!userId) {
        return { mountain: null, error: { message: 'User ID required' } }
    }

    const { data, error } = await supabase
        .from('mountains')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching mountain:', error.message)
        return { mountain: null, error }
    }

    return { mountain: data || null, error: null }
}

/**
 * Create a new mountain for the user
 * Enforces one mountain per user rule
 * @param {string} userId 
 * @param {object} mountainData - { title, target } or { mission_name, goal_target }
 * @returns {Promise<{mountain: object|null, error: object|null}>}
 */
export const createMountain = async (userId, mountainData) => {
    if (!userId) {
        return { mountain: null, error: { message: 'User ID required' } }
    }

    // Check if user already has a mountain (enforce one per user)
    const { mountain: existing } = await fetchUserMountain(userId)
    if (existing) {
        console.log('User already has a mountain, returning existing')
        return { mountain: existing, error: null }
    }

    // Map field names (support both naming conventions)
    const title = mountainData.title || mountainData.mission_name
    const target = mountainData.target || mountainData.goal_target
    const totalStepsPlanned = mountainData.total_steps_planned || 6

    if (!title || !target) {
        return { mountain: null, error: { message: 'Title and target are required' } }
    }

    console.log('Creating mountain:', { userId, title, target, totalStepsPlanned })

    const { data, error } = await supabase
        .from('mountains')
        .insert([{
            user_id: userId,
            title: title,
            target: target,
            total_steps_planned: totalStepsPlanned
        }])
        .select()
        .single()

    if (error) {
        console.error('Error creating mountain:', error.message)
        return { mountain: null, error }
    }

    console.log('Mountain created successfully:', data)
    return { mountain: data, error: null }
}

/**
 * Get or create a mountain for the user
 * @param {string} userId 
 * @param {object} mountainData - { title, target } 
 * @returns {Promise<{mountain: object|null, error: object|null}>}
 */
export const getOrCreateMountain = async (userId, mountainData) => {
    const { mountain: existing } = await fetchUserMountain(userId)

    if (existing) {
        return { mountain: existing, error: null }
    }

    return createMountain(userId, mountainData)
}

/**
 * Update mountain details
 * @param {string} mountainId 
 * @param {object} updates - { title?, target? }
 * @returns {Promise<{mountain: object|null, error: object|null}>}
 */
export const updateMountain = async (mountainId, updates) => {
    const { data, error } = await supabase
        .from('mountains')
        .update(updates)
        .eq('id', mountainId)
        .select()
        .single()

    if (error) {
        console.error('Error updating mountain:', error.message)
        return { mountain: null, error }
    }

    return { mountain: data, error: null }
}

/**
 * Increment share count for a mountain
 * @param {string} mountainId 
 * @returns {Promise<{mountain: object|null, error: object|null}>}
 */
export const incrementShareCount = async (mountainId) => {
    // We can't use a simple atomic increment with Supabase JS easily without RPC or raw SQL.
    // Given the constraints (no RPC creation requested), we'll do read-modify-write.
    // For MVP scale this is fine. Pro users have unlimited anyway.

    const { data: current, error: fetchError } = await supabase
        .from('mountains')
        .select('share_count')
        .eq('id', mountainId)
        .single()

    if (fetchError) return { mountain: null, error: fetchError }

    const newCount = (current.share_count || 0) + 1

    const { data, error } = await supabase
        .from('mountains')
        .update({ share_count: newCount })
        .eq('id', mountainId)
        .select()
        .single()

    if (error) {
        console.error('Error incrementing share count:', error.message)
        return { mountain: null, error }
    }

    return { mountain: data, error: null }
}
