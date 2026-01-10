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

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import * as mountainService from '../lib/mountainService'
import * as stepsService from '../lib/stepsService'
import * as notesService from '../lib/notesService'
import * as milestoneService from '../lib/milestoneService'
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
    const [milestones, setMilestones] = useState([])
    const [checkins, setCheckins] = useState([])
    const [recentlyUnlockedMilestone, setRecentlyUnlockedMilestone] = useState(null)
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
            const demoMilestones = demoStorage.getDemoMilestones()
            const demoCheckins = demoStorage.getDemoCheckins()

            setCurrentMountain(demoMountain)
            setSteps(demoSteps)
            setJourneyNotes(demoNotes)
            setProductImages(demoImages)
            setMilestones(demoMilestones)
            setCheckins(demoCheckins)
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
     * Fetch steps when mountain changes (AUTHENTICATED mode only)
     * Demo mode already loads steps synchronously in the first useEffect
     */
    useEffect(() => {
        // Skip for demo mode - data already loaded
        if (!user) return

        if (!currentMountain) {
            setSteps([])
            setJourneyNotes([])
            setMilestones([])
            setCheckins([])
            return
        }

        const loadData = async () => {
            // Load steps
            const { steps: fetchedSteps } = await stepsService.fetchSteps(currentMountain.id)
            setSteps(fetchedSteps)

            // Load milestones
            const { milestones: fetchedMilestones } = await milestoneService.fetchMilestones(currentMountain.id)
            setMilestones(fetchedMilestones)
        }

        loadData()
    }, [currentMountain, user])

    /**
     * Fetch journey notes when steps change (AUTHENTICATED mode only)
     * Demo mode already loads notes synchronously in the first useEffect
     */
    useEffect(() => {
        // Skip for demo mode - data already loaded
        if (!user) return

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
    }, [steps, user])

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
     * Save a journey note for a step (ALWAYS creates a new note - supports multiple notes per step)
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

        // AUTHENTICATED MODE: Use Supabase - ALWAYS create new note (supports multiple per step)
        const { note, error: saveError } = await notesService.createJourneyNote(stepId, {
            title: noteData.lesson_learned?.slice(0, 60) || 'Lesson', // Use lesson as title
            reflection_text: noteData.reflection_text,
            lesson_learned: noteData.lesson_learned
        }, result)

        if (saveError) {
            setError(saveError.message)
            return { success: false, error: saveError }
        }

        // ALWAYS add the new note to state (never replace)
        setJourneyNotes(prev => [...prev, note])

        return { success: true, note }
    }, [user])

    /**
     * Delete a journey note (supports multiple notes per step)
     * - If other notes remain, step status = latest remaining note's result
     * - If no notes remain, step status = pending
     * @param {number} stepId - step ID
     * @param {number} noteId - note ID
     */
    const deleteNoteAndResetStep = useCallback(async (stepId, noteId) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const deleteResult = demoStorage.deleteDemoNote(noteId)
            if (deleteResult.success) {
                const remainingNotes = demoStorage.getDemoNotes().filter(n => n.step_id === stepId)

                // Determine new status based on remaining notes
                let newStatus = 'pending'
                if (remainingNotes.length > 0) {
                    const latestNote = remainingNotes[remainingNotes.length - 1]
                    newStatus = latestNote.result === 'failure' ? 'failed' : latestNote.result
                }

                const updateResult = demoStorage.updateDemoStep(stepId, { status: newStatus })
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

        // Update notes state first
        const remainingNotes = journeyNotes.filter(n => n.id !== noteId && n.step_id === stepId)

        // Determine new status based on remaining notes
        let newStatus = 'pending'
        if (remainingNotes.length > 0) {
            const latestNote = remainingNotes[remainingNotes.length - 1]
            newStatus = latestNote.result === 'failure' ? 'failed' : latestNote.result
        }

        // Update step status
        const { step, error: updateError } = await stepsService.updateStepStatus(stepId, newStatus)
        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        // Update state
        setJourneyNotes(prev => prev.filter(n => n.id !== noteId))
        setSteps(prev => prev.map(s => s.id === stepId ? step : s))

        return { success: true }
    }, [user, journeyNotes])

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

    // Computed values - Progress calculation
    // Supports TWO modes:
    // 1. METRIC-BASED: If target_value exists, use current_value / target_value
    // 2. STEP-BASED: Fallback to successfulSteps / totalPlanned
    const successfulSteps = steps.filter(s => s.status === 'success').length
    const resolvedSteps = steps.filter(s => s.status === 'success' || s.status === 'failed').length
    const totalPlanned = currentMountain?.total_steps_planned || steps.length || 1

    // Check if using metric-based progress
    // hasMetricProgress is TRUE when target_value is set and > 0
    const hasMetricProgress = currentMountain?.target_value && currentMountain.target_value > 0

    // Calculate metric progress - handle null/undefined current_value as 0
    const currentValue = currentMountain?.current_value ?? 0
    const metricProgress = hasMetricProgress
        ? Math.min((currentValue / currentMountain.target_value) * 100, 100)
        : null

    const stepProgress = Math.min((successfulSteps / totalPlanned) * 100, 100)

    // Use metric progress if available, otherwise use step progress
    const progress = hasMetricProgress ? metricProgress : stepProgress

    /**
     * Update metric progress value (current_value)
     * @param {number} newValue - New current value
     */
    const updateMetricProgress = useCallback(async (newValue) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.updateDemoMetricProgress(newValue)
            if (result.success) {
                setCurrentMountain(result.mountain)
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { data, error: updateError } = await mountainService.updateMountain(currentMountain.id, {
            current_value: newValue,
            progress_history: [
                ...(currentMountain.progress_history || []),
                { date: new Date().toISOString(), value: newValue }
            ]
        })

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setCurrentMountain(data)
        return { success: true, mountain: data }
    }, [user, currentMountain])

    /**
     * Setup metric tracking for the mountain
     * @param {object} metricData - { target_value, metric_prefix, metric_suffix }
     */
    const setupMetricTracking = useCallback(async (metricData) => {
        // DEMO MODE: Use localStorage
        if (!user) {
            const result = demoStorage.updateDemoMountain(metricData)
            if (result.success) {
                setCurrentMountain(result.mountain)
            }
            return result
        }

        // AUTHENTICATED MODE: Use Supabase
        const { data, error: updateError } = await mountainService.updateMountain(currentMountain.id, metricData)

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setCurrentMountain(data)
        return { success: true, mountain: data }
    }, [user, currentMountain])
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

    // ============ MILESTONE FUNCTIONS ============

    /**
     * Create milestones for the journey
     */
    const createMilestones = useCallback(async (milestonesData) => {
        if (!currentMountain) return { success: false, error: 'No mountain' }

        // DEMO MODE
        if (!user) {
            const result = demoStorage.addDemoMilestonesBatch(milestonesData)
            if (result.success) {
                setMilestones(demoStorage.getDemoMilestones())
            }
            return result
        }

        // AUTHENTICATED MODE
        const { milestones: created, error: createError } = await milestoneService.createMilestonesBatch(
            currentMountain.id,
            user.id,
            milestonesData
        )

        if (createError) {
            setError(createError.message)
            return { success: false, error: createError }
        }

        setMilestones(created)
        return { success: true, milestones: created }
    }, [user, currentMountain])

    /**
     * Update a milestone
     */
    const updateMilestone = useCallback(async (milestoneId, updates) => {
        // DEMO MODE
        if (!user) {
            const result = demoStorage.updateDemoMilestone(milestoneId, updates)
            if (result.success) {
                setMilestones(demoStorage.getDemoMilestones())
            }
            return result
        }

        // AUTHENTICATED MODE
        const { milestone, error: updateError } = await milestoneService.updateMilestone(milestoneId, updates)

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setMilestones(prev => prev.map(m => m.id === milestoneId ? milestone : m))
        return { success: true, milestone }
    }, [user])

    /**
     * Delete a milestone
     */
    const deleteMilestone = useCallback(async (milestoneId) => {
        // DEMO MODE
        if (!user) {
            const result = demoStorage.deleteDemoMilestone(milestoneId)
            if (result.success) {
                setMilestones(demoStorage.getDemoMilestones())
                setCheckins(demoStorage.getDemoCheckins())
            }
            return result
        }

        // AUTHENTICATED MODE
        const { error: deleteError } = await milestoneService.deleteMilestone(milestoneId)

        if (deleteError) {
            setError(deleteError.message)
            return { success: false, error: deleteError }
        }

        setMilestones(prev => prev.filter(m => m.id !== milestoneId))
        setCheckins(prev => prev.filter(c => c.milestone_id !== milestoneId))
        return { success: true }
    }, [user])

    /**
     * Daily check-in for a milestone
     */
    const checkIn = useCallback(async (milestoneId, keptPromise, note = null) => {
        const today = new Date().toISOString().split('T')[0]

        // DEMO MODE
        if (!user) {
            const result = demoStorage.upsertDemoCheckin(milestoneId, today, keptPromise, note)
            if (result.success) {
                setCheckins(demoStorage.getDemoCheckins())
            }
            return result
        }

        // AUTHENTICATED MODE
        const { checkin, error: checkinError } = await milestoneService.upsertCheckin(
            milestoneId,
            user.id,
            today,
            keptPromise,
            note
        )

        if (checkinError) {
            setError(checkinError.message)
            return { success: false, error: checkinError }
        }

        // Update or add to checkins
        setCheckins(prev => {
            const existingIndex = prev.findIndex(c => c.milestone_id === milestoneId && c.checkin_date === today)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = checkin
                return updated
            }
            return [...prev, checkin]
        })

        return { success: true, checkin }
    }, [user])

    /**
     * Update progress and check for milestone unlocks
     */
    const updateProgressWithMilestones = useCallback(async (newValue) => {
        // DEMO MODE
        if (!user) {
            // Update progress
            const progressResult = demoStorage.updateDemoMetricProgress(newValue)
            if (!progressResult.success) return progressResult

            // Check milestones
            const milestoneResult = demoStorage.checkAndUnlockDemoMilestones(newValue)

            setCurrentMountain(progressResult.mountain)
            setMilestones(milestoneResult.milestones || [])

            // Trigger celebration for newly unlocked
            if (milestoneResult.newlyUnlocked?.length > 0) {
                setRecentlyUnlockedMilestone(milestoneResult.newlyUnlocked[0])
            }

            return {
                success: true,
                mountain: progressResult.mountain,
                newlyUnlocked: milestoneResult.newlyUnlocked || []
            }
        }

        // AUTHENTICATED MODE
        const { data, error: updateError } = await mountainService.updateMountain(currentMountain.id, {
            current_value: newValue,
            progress_history: [
                ...(currentMountain.progress_history || []),
                { date: new Date().toISOString(), value: newValue }
            ]
        })

        if (updateError) {
            setError(updateError.message)
            return { success: false, error: updateError }
        }

        setCurrentMountain(data)

        // Refresh milestones (trigger auto-unlocks)
        const { milestones: updatedMilestones } = await milestoneService.fetchMilestones(currentMountain.id)
        const previousMilestones = milestones
        setMilestones(updatedMilestones)

        // Find newly unlocked
        const newlyUnlocked = updatedMilestones.filter(m =>
            m.is_unlocked && !previousMilestones.find(pm => pm.id === m.id && pm.is_unlocked)
        )

        if (newlyUnlocked.length > 0) {
            setRecentlyUnlockedMilestone(newlyUnlocked[0])
        }

        return { success: true, mountain: data, newlyUnlocked }
    }, [user, currentMountain, milestones])

    /**
     * Clear recently unlocked milestone (after showing celebration)
     */
    const clearRecentlyUnlockedMilestone = useCallback(() => {
        setRecentlyUnlockedMilestone(null)
    }, [])

    /**
     * Get current (next unlockable) milestone
     */
    const currentMilestone = useMemo(() => {
        const sorted = [...milestones].sort((a, b) => a.target_value - b.target_value)
        return sorted.find(m => !m.is_unlocked) || null
    }, [milestones])

    /**
     * Get streak stats for current milestone
     */
    const getCurrentMilestoneStreak = useCallback((milestoneId) => {
        if (!user) {
            return demoStorage.getDemoMilestoneStreak(milestoneId)
        }
        // For authenticated, we'd call the RPC but for now return from local checkins
        const milestoneCheckins = checkins.filter(c => c.milestone_id === milestoneId)
        if (milestoneCheckins.length === 0) {
            return { current_streak: 0, longest_streak: 0, total_days: 0, kept_days: 0, slip_days: 0, commitment_rate: 0 }
        }

        const sorted = [...milestoneCheckins].sort((a, b) => new Date(b.checkin_date) - new Date(a.checkin_date))
        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0

        for (const c of sorted) {
            if (c.kept_promise) {
                currentStreak++
            } else {
                break
            }
        }

        for (const c of sorted) {
            if (c.kept_promise) {
                tempStreak++
                if (tempStreak > longestStreak) longestStreak = tempStreak
            } else {
                tempStreak = 0
            }
        }

        const totalDays = milestoneCheckins.length
        const keptDays = milestoneCheckins.filter(c => c.kept_promise).length
        const slipDays = totalDays - keptDays
        const commitmentRate = totalDays > 0 ? Math.round((keptDays / totalDays) * 100) : 0

        return { current_streak: currentStreak, longest_streak: longestStreak, total_days: totalDays, kept_days: keptDays, slip_days: slipDays, commitment_rate: commitmentRate }
    }, [user, checkins])

    const hasMountain = !!currentMountain

    const value = {
        // State
        currentMountain,
        steps,
        journeyNotes,
        stickyNotes: journeyNotes, // Alias for backward compatibility
        productImages,
        milestones,
        checkins,
        currentMilestone,
        recentlyUnlockedMilestone,
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

        // Metric progress computed values
        hasMetricProgress,
        metricProgress,
        stepProgress,

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
        updateMetricProgress,
        setupMetricTracking,

        // Milestone Actions
        createMilestones,
        updateMilestone,
        deleteMilestone,
        checkIn,
        updateProgressWithMilestones,
        clearRecentlyUnlockedMilestone,
        getCurrentMilestoneStreak,

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

