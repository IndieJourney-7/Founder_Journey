/**
 * Steps Service
 * 
 * Handles all step-related database operations.
 * Note: steps.id is bigint (auto-increment), not uuid
 */

import { supabase } from './supabase'

/**
 * Fetch all steps for a mountain
 * @param {string} mountainId - UUID of the mountain
 * @returns {Promise<{steps: array, error: object|null}>}
 */
export const fetchSteps = async (mountainId) => {
    if (!mountainId) {
        return { steps: [], error: { message: 'Mountain ID required' } }
    }

    const { data, error } = await supabase
        .from('steps')
        .select('*')
        .eq('mountain_id', mountainId)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching steps:', error.message)
        return { steps: [], error }
    }

    return { steps: data || [], error: null }
}

/**
 * Add a new step to a mountain
 * @param {string} mountainId - UUID of the mountain
 * @param {object} stepData - { title, status? }
 * @param {number} orderIndex - Position in the list
 * @returns {Promise<{step: object|null, error: object|null}>}
 */
/**
 * Add a new step to a mountain
 * @param {string} mountainId - UUID of the mountain
 * @param {object} stepData - { title, status? }
 * @param {number} orderIndex - Position in the list
 * @returns {Promise<{step: object|null, error: object|null}>}
 */
export const addStep = async (mountainId, stepData, orderIndex = 0) => {
    if (!mountainId) {
        return { step: null, error: { message: 'Mountain ID required' } }
    }

    // Integrity Check: Verify previous step is resolved
    const { data: lastSteps } = await supabase
        .from('steps')
        .select('*')
        .eq('mountain_id', mountainId)
        .order('order_index', { ascending: false })
        .limit(1)

    if (lastSteps && lastSteps.length > 0) {
        const lastStep = lastSteps[0]

        // 1. Check status
        if (lastStep.status !== 'success' && lastStep.status !== 'failed') {
            return { step: null, error: { message: 'Previous step must be completed (Success/Fail) first.' } }
        }

        // 2. Check for note
        const { data: note } = await supabase
            .from('journey_notes')
            .select('id')
            .eq('step_id', lastStep.id)
            .maybeSingle()

        if (!note) {
            return { step: null, error: { message: 'Previous step requires a reflection note.' } }
        }
    }

    const { data, error } = await supabase
        .from('steps')
        .insert([{
            mountain_id: mountainId,
            title: stepData.title,
            status: stepData.status || 'pending',
            order_index: orderIndex
        }])
        .select()
        .single()

    if (error) {
        console.error('Error adding step:', error.message)
        return { step: null, error }
    }

    return { step: data, error: null }
}

/**
 * Update a step's status
 * @param {number} stepId - bigint ID of the step
 * @param {string} status - 'pending' | 'in-progress' | 'success' | 'failed'
 * @returns {Promise<{step: object|null, error: object|null}>}
 */
export const updateStepStatus = async (stepId, status) => {
    const { data, error } = await supabase
        .from('steps')
        .update({ status })
        .eq('id', stepId)
        .select()
        .single()

    if (error) {
        console.error('Error updating step status:', error.message)
        return { step: null, error }
    }

    return { step: data, error: null }
}

/**
 * Update a step's details
 * @param {number} stepId - bigint ID of the step
 * @param {object} updates - { title?, status?, order_index? }
 * @returns {Promise<{step: object|null, error: object|null}>}
 */
export const updateStep = async (stepId, updates) => {
    console.log(`Attempting to update step ${stepId}:`, updates)
    const { data, error } = await supabase
        .from('steps')
        .update(updates)
        .eq('id', stepId)
        .select()
        .single()

    if (error) {
        console.error('Error updating step:', error.message, error)
        return { step: null, error }
    }

    console.log('Step updated successfully:', data)
    return { step: data, error: null }
}

/**
 * Delete a step
 * @param {number} stepId - bigint ID of the step
 * @returns {Promise<{error: object|null}>}
 */
export const deleteStep = async (stepId) => {
    console.log(`Attempting to delete step ${stepId}`)
    const { error } = await supabase
        .from('steps')
        .delete()
        .eq('id', stepId)

    if (error) {
        console.error('Error deleting step:', error.message, error)
        return { error }
    }

    console.log('Step deleted successfully')
    return { error: null }
}
