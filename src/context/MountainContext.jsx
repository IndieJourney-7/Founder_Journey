/**
 * Mountain Context
 *
 * Manages the user's mountain journey state.
 * Supports BOTH authenticated (Supabase) and demo mode (localStorage).
 *
 * Aligned with actual Supabase schema:
 * - mountains (id uuid, user_id uuid, title, target)
 * - steps (id bigint, mountain_id uuid, title, status, order_index)
 * - journey_notes (id bigint, step_id bigint, notes)
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as mountainService from '../lib/mountainService'
import * as stepsService from '../lib/stepsService'
import * as notesService from '../lib/notesService'
import * as demoStorage from '../lib/demoModeStorage'

const MountainContext = createContext()

export const useMountain = () => useContext(MountainContext)

export const MountainProvider = ({ children }) => {
    const { user } = useAuth()

    // State
    const [currentMountain, setCurrentMountain] = useState(null)
    const [steps, setSteps] = useState([])
    const [journeyNotes, setJourneyNotes] = useState([])
    const [productImages, setProductImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isDemoMode, setIsDemoMode] = useState(false)

    /**
     * Fetch user's mountain (Supabase) OR load demo data (localStorage)
     */
    useEffect(() => {
        // DEMO MODE: User not logged in
        if (!user) {
            setIsDemoMode(true)

            // Initialize with inspiring pre-populated demo if no existing data
            if (!demoStorage.hasDemoData()) {
                demoStorage.initializeInspiringDemo()
            }

            const demoMountain = demoStorage.getDemoMountain()
            const demoSteps = demoStorage.getDemoSteps()
            const demoNotes = demoStorage.getDemoNotes()
            const demoImages = demoStorage.getDemoProductImages()

            setCurrentMountain(demoMountain)
            setSteps(demoSteps)
            setJourneyNotes(demoNotes)
            setProductImages(demoImages)
            setLoading(false)
            return
        }

        // AUTHENTICATED MODE: Load from Supabase
        setIsDemoMode(false)
        const loadMountain = async () => {
            setLoading(true)
            setError(null)

            const { mountain, error: fetchError } = await mountainService.fetchUserMountain(user.id)

            if (fetchError) {
                setError(fetchError.message)
            }

            setCurrentMountain(mountain)
            setLoading(false)
        }

        loadMountain()
    }, [user])

    /**
     * Fetch steps when mountain changes
     */
    useEffect(() => {
        if (!currentMountain) {
            setSteps([])
            setJourneyNotes([])
            return
        }

        const loadSteps = async () => {
            const { steps: fetchedSteps } = await stepsService.fetchSteps(currentMountain.id)
            setSteps(fetchedSteps)
        }

        loadSteps()
    }, [currentMountain])

    /**
     * Fetch journey notes when steps change
     */
    useEffect(() => {
        if (steps.length === 0) {
            setJourneyNotes([])
            return
        }

        const loadNotes = async () => {
            const stepIds = steps.map(s => s.id)
            const { notes } = await notesService.fetchNotesForSteps(stepIds)
            setJourneyNotes(notes)
        }

        loadNotes()
    }, [steps])

    /**
     * Create a new mountain (if user doesn't have one)
     */
    const createMountain = useCallback(async (mountainData) => {
        if (!user) return { success: false, error: 'Not authenticated' }

        const { mountain, error: createError } = await mountainService.createMountain(user.id, mountainData)

        if (createError) {
            setError(createError.message)
            return { success: false, error: createError }
        }

        setCurrentMountain(mountain)
        return { success: true, mountain }
    }, [user])

    /**
     * Add a step to the current mountain
     */
    const addStep = useCallback(async (stepData) => {
        if (!currentMountain) {
            return { success: false, error: 'No mountain selected' }
        }

        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.addDemoStep(stepData)
            if (result.limitReached) {
                // Caller should show signup prompt for step limit
                return result
            }
            if (result.success) {
                setSteps(demoStorage.getDemoSteps())
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { step, error: addError } = await stepsService.addStep(
            currentMountain.id,
            stepData,
            steps.length,
            user.id
        )

        if (addError) {
            setError(addError.message)
            return { success: false, error: addError }
        }

        setSteps(prev => [...prev, step])
        return { success: true, step }
    }, [currentMountain, steps.length, user])

    /**
     * Update a step's status
     */
    const updateStepStatus = useCallback(async (stepId, status) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.updateDemoStep(stepId, { status })
            if (result.success) {
                setSteps(demoStorage.getDemoSteps())
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { step, error: updateError } = await stepsService.updateStepStatus(stepId, status)

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setSteps(prev => prev.map(s => s.id === stepId ? step : s))
        return { success: true, step }
    }, [user])

    /**
     * Save a journey note for a step
     * @param {number} stepId - step ID
     * @param {object} noteData - { reflection_text, lesson_learned }
     * @param {string} result - 'success' or 'failed'
     */
    const saveJourneyNote = useCallback(async (stepId, noteData, result) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const demoResult = demoStorage.addDemoNote(stepId, noteData, result)
            if (demoResult.success) {
                setJourneyNotes(demoStorage.getDemoNotes())
            }
            return demoResult
        }

        // AUTHENTICATED MODE: Use Supabase
        const { note, error: saveError } = await notesService.saveJourneyNote(stepId, noteData, result)

        if (saveError) {
            setError(saveError.message)
            return { success: false, error: saveError }
        }

        // Update or add the note in state
        setJourneyNotes(prev => {
            const exists = prev.find(n => n.step_id === stepId)
            if (exists) {
                return prev.map(n => n.step_id === stepId ? note : n)
            }
            return [...prev, note]
        })

        return { success: true, note }
    }, [user])

    /**
     * Delete a journey note and reset step to pending
     * @param {number} stepId - step ID
     * @param {number} noteId - note ID
     */
    const deleteNoteAndResetStep = useCallback(async (stepId, noteId) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const deleteResult = demoStorage.deleteDemoNote(noteId)
            if (deleteResult.success) {
                const updateResult = demoStorage.updateDemoStep(stepId, { status: 'pending' })
                if (updateResult.success) {
                    setJourneyNotes(demoStorage.getDemoNotes())
                    setSteps(demoStorage.getDemoSteps())
                    return { success: true }
                }
                return updateResult
            }
            return deleteResult
        }

        // AUTHENTICATED MODE: Use Supabase
        // Delete the note
        const { error: deleteError } = await notesService.deleteJourneyNote(noteId)
        if (deleteError) {
            setError(deleteError.message)
            return { success: false, error: deleteError }
        }

        // Reset step to pending
        const { step, error: updateError } = await stepsService.updateStepStatus(stepId, 'pending')
        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        // Update state
        setJourneyNotes(prev => prev.filter(n => n.id !== noteId))
        setSteps(prev => prev.map(s => s.id === stepId ? step : s))

        return { success: true }
    }, [user])

    /**
     * Add a product image
     * @param {object} imageData - { data: base64string, name: string }
     */
    const addProductImage = useCallback(async (imageData) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.addDemoProductImage(imageData)
            if (result.success) {
                setProductImages(demoStorage.getDemoProductImages())
            }
            return result
        }

        // AUTHENTICATED MODE: TODO - Use Supabase Storage
        // For now, use localStorage as fallback
        const result = demoStorage.addDemoProductImage(imageData)
        if (result.success) {
            setProductImages(demoStorage.getDemoProductImages())
        }
        return result
    }, [user])

    /**
     * Delete a product image
     * @param {string} imageId
     */
    const deleteProductImage = useCallback(async (imageId) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.deleteDemoProductImage(imageId)
            if (result.success) {
                setProductImages(demoStorage.getDemoProductImages())
            }
            return result
        }

        // AUTHENTICATED MODE: TODO - Use Supabase Storage
        const result = demoStorage.deleteDemoProductImage(imageId)
        if (result.success) {
            setProductImages(demoStorage.getDemoProductImages())
        }
        return result
    }, [user])

    /**
     * Increment share count
     */
    const incrementShareCount = useCallback(async () => {
        if (!currentMountain) return { success: false }

        const { mountain, error } = await mountainService.incrementShareCount(currentMountain.id)
        if (error) {
            console.error(error)
            return { success: false, error }
        }

        setCurrentMountain(mountain)
        return { success: true, mountain }
    }, [currentMountain])

    /**
     * Refresh all data
     */
    const refresh = useCallback(async () => {
        if (!user) return

        setLoading(true)
        const { mountain } = await mountainService.fetchUserMountain(user.id)
        setCurrentMountain(mountain)

        if (mountain) {
            const { steps: freshSteps } = await stepsService.fetchSteps(mountain.id)
            setSteps(freshSteps)

            if (freshSteps.length > 0) {
                const stepIds = freshSteps.map(s => s.id)
                const { notes } = await notesService.fetchNotesForSteps(stepIds)
                setJourneyNotes(notes)
            }
        }
        setLoading(false)
    }, [user])

    // Computed values - Progress based on total_steps_planned
    // Only count successful steps for progress (failures don't move the climber forward)
    const successfulSteps = steps.filter(s => s.status === 'success').length
    const resolvedSteps = steps.filter(s => s.status === 'success' || s.status === 'failed').length
    const totalPlanned = currentMountain?.total_steps_planned || steps.length || 1
    const progress = Math.min((successfulSteps / totalPlanned) * 100, 100)
    /**
     * Delete a step
     * @param {number} stepId
     */
    const deleteStep = useCallback(async (stepId) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.deleteDemoStep(stepId)
            if (result.success) {
                setSteps(demoStorage.getDemoSteps())
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { error: deleteError } = await stepsService.deleteStep(stepId)

        if (deleteError) {
            setError(deleteError.message)
            return { success: false, error: deleteError }
        }

        setSteps(prev => prev.filter(s => s.id !== stepId))
        return { success: true }
    }, [user])

    /**
     * Edit a step (title, etc)
     * @param {number} stepId
     * @param {object} updates
     */
    const editStep = useCallback(async (stepId, updates) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.updateDemoStep(stepId, updates)
            if (result.success) {
                setSteps(demoStorage.getDemoSteps())
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { step, error: updateError } = await stepsService.updateStep(stepId, updates)

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setSteps(prev => prev.map(s => s.id === stepId ? step : s))
        return { success: true, step }
    }, [user])

    const hasMountain = !!currentMountain

    const value = {
        // State
        currentMountain,
        steps,
        journeyNotes,
        stickyNotes: journeyNotes, // Alias for backward compatibility
        productImages,
        loading,
        error,
        isDemoMode, // Demo mode flag

        // Computed
        progress,
        hasMountain,
        successfulSteps,
        resolvedSteps,
        totalSteps: steps.length,
        totalPlanned,

        // Actions
        createMountain,
        addMountain: createMountain, // Alias
        addStep,
        updateStepStatus,
        deleteStep,
        editStep,
        saveJourneyNote,
        deleteNoteAndResetStep,
        addStickyNote: saveJourneyNote, // Alias
        addProductImage,
        deleteProductImage,
        refresh,

        // Setters
        setCurrentMountain,
        incrementShareCount
    }

    return (
        <MountainContext.Provider value={value}>
            {children}
        </MountainContext.Provider>
    )
}

