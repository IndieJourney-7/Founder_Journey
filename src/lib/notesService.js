/**
 * Journey Notes Service
 * 
 * Handles journey notes for steps.
 * Table: journey_notes (id, step_id, result, reflection_text, lesson_learned, created_at)
 */

import { supabase } from './supabase'

/**
 * Fetch all journey notes for given step IDs
 * @param {number[]} stepIds - Array of step IDs
 * @returns {Promise<{notes: array, error: object|null}>}
 */
export const fetchNotesForSteps = async (stepIds) => {
    if (!stepIds || stepIds.length === 0) {
        return { notes: [], error: null }
    }

    const { data, error } = await supabase
        .from('journey_notes')
        .select('*')
        .in('step_id', stepIds)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching notes:', error.message)
        return { notes: [], error }
    }

    return { notes: data || [], error: null }
}

/**
 * Fetch a single note for a step
 * @param {number} stepId - step ID
 * @returns {Promise<{note: object|null, error: object|null}>}
 */
export const fetchNoteForStep = async (stepId) => {
    const { data, error } = await supabase
        .from('journey_notes')
        .select('*')
        .eq('step_id', stepId)
        .maybeSingle()

    if (error) {
        console.error('Error fetching note:', error.message)
        return { note: null, error }
    }

    return { note: data || null, error: null }
}

/**
 * Save a journey note for a step (create or update)
 * @param {number} stepId - step ID
 * @param {object} noteData - { reflection_text, lesson_learned }
 * @param {string} result - 'success' or 'failed'
 * @returns {Promise<{note: object|null, error: object|null}>}
 */
export const saveJourneyNote = async (stepId, noteData, result) => {
    if (!stepId) {
        return { note: null, error: { message: 'Step ID required' } }
    }

    // Check if note already exists for this step
    const { note: existing } = await fetchNoteForStep(stepId)

    // Map 'failed' to 'failure' to match DB constraint check (result in ('success', 'failure'))
    const dbResult = result === 'failed' ? 'failure' : result

    const notePayload = {
        reflection_text: noteData.reflection_text,
        lesson_learned: noteData.lesson_learned,
        result: dbResult
    }

    if (existing) {
        // Update existing note
        const { data, error } = await supabase
            .from('journey_notes')
            .update({
                ...notePayload,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating note:', error.message)
            return { note: null, error }
        }

        return { note: data, error: null }
    }

    // Create new note
    const { data, error } = await supabase
        .from('journey_notes')
        .insert([{ step_id: stepId, ...notePayload }])
        .select()
        .single()

    if (error) {
        console.error('Error creating note:', error.message)
        return { note: null, error }
    }

    return { note: data, error: null }
}

/**
 * Delete a journey note and reset step to pending
 * @param {number} noteId - note ID
 * @returns {Promise<{error: object|null}>}
 */
export const deleteJourneyNote = async (noteId) => {
    const { error } = await supabase
        .from('journey_notes')
        .delete()
        .eq('id', noteId)

    if (error) {
        console.error('Error deleting note:', error.message)
    }

    return { error }
}
