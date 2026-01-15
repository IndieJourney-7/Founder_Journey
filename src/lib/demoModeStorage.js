/**
 * Demo Mode Storage Utility
 *
 * Manages localStorage for anonymous users trying the app.
 * Allows full experience without signup, then migrates to Supabase on signup.
 */

const DEMO_KEYS = {
    MOUNTAIN: 'shift_demo_mountain',
    STEPS: 'shift_demo_steps',
    NOTES: 'shift_demo_notes',
    PRODUCT_IMAGES: 'shift_demo_product_images',
    MILESTONES: 'shift_demo_milestones',
    CHECKINS: 'shift_demo_checkins'
};

const MAX_DEMO_STEPS = 6; // Match free tier limit
const MAX_DEMO_MILESTONES = 10; // Limit for demo mode

// Generate temporary IDs for demo mode
const generateDemoId = () => {
    return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// ============ MOUNTAIN ============

export const getDemoMountain = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.MOUNTAIN);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting demo mountain:', error);
        return null;
    }
};

export const saveDemoMountain = (mountainData) => {
    try {
        const mountain = {
            id: generateDemoId(),
            title: mountainData.title || 'My First Mountain',
            target: mountainData.target || '10 steps',
            total_steps_planned: mountainData.total_steps_planned || 10,
            // Metric-based progress tracking
            target_value: mountainData.target_value || null,      // e.g., 1000 (for $1K)
            current_value: mountainData.current_value || 0,       // e.g., 247 (current $)
            metric_prefix: mountainData.metric_prefix || '',      // e.g., "$"
            metric_suffix: mountainData.metric_suffix || '',      // e.g., "MRR", "followers"
            progress_history: mountainData.progress_history || [], // [{date, value}]
            created_at: new Date().toISOString(),
            ...mountainData
        };
        localStorage.setItem(DEMO_KEYS.MOUNTAIN, JSON.stringify(mountain));
        return mountain;
    } catch (error) {
        console.error('Error saving demo mountain:', error);
        return null;
    }
};

/**
 * Update demo mountain with new data (for metric progress updates)
 */
export const updateDemoMountain = (updates) => {
    try {
        const mountain = getDemoMountain();
        if (!mountain) return { success: false, error: 'No mountain found' };

        const updatedMountain = {
            ...mountain,
            ...updates,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.MOUNTAIN, JSON.stringify(updatedMountain));
        return { success: true, mountain: updatedMountain };
    } catch (error) {
        console.error('Error updating demo mountain:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update metric progress value and add to history
 */
export const updateDemoMetricProgress = (newValue) => {
    try {
        const mountain = getDemoMountain();
        if (!mountain) return { success: false, error: 'No mountain found' };

        const history = mountain.progress_history || [];
        history.push({
            date: new Date().toISOString(),
            value: newValue
        });

        const updatedMountain = {
            ...mountain,
            current_value: newValue,
            progress_history: history,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.MOUNTAIN, JSON.stringify(updatedMountain));
        return { success: true, mountain: updatedMountain };
    } catch (error) {
        console.error('Error updating metric progress:', error);
        return { success: false, error: error.message };
    }
};

// ============ STEPS ============

export const getDemoSteps = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.STEPS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting demo steps:', error);
        return [];
    }
};

export const addDemoStep = (stepData) => {
    try {
        const steps = getDemoSteps();

        // Enforce 6-step limit
        if (steps.length >= MAX_DEMO_STEPS) {
            return {
                success: false,
                error: 'Demo mode limited to 6 steps. Sign up for unlimited steps!',
                limitReached: true
            };
        }

        const mountain = getDemoMountain();
        const newStep = {
            id: generateDemoId(),
            mountain_id: mountain?.id || 'demo_mountain',
            title: stepData.title,
            description: stepData.description || '',
            expected_outcome: stepData.expected_outcome || '',
            status: stepData.status || 'pending',
            order_index: steps.length,
            created_at: new Date().toISOString(),
            ...stepData
        };

        steps.push(newStep);
        localStorage.setItem(DEMO_KEYS.STEPS, JSON.stringify(steps));
        return { success: true, step: newStep };
    } catch (error) {
        console.error('Error adding demo step:', error);
        return { success: false, error: error.message };
    }
};

export const updateDemoStep = (stepId, updates) => {
    try {
        const steps = getDemoSteps();
        const stepIndex = steps.findIndex(s => s.id === stepId);

        if (stepIndex === -1) {
            return { success: false, error: 'Step not found' };
        }

        steps[stepIndex] = {
            ...steps[stepIndex],
            ...updates,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.STEPS, JSON.stringify(steps));
        return { success: true, step: steps[stepIndex] };
    } catch (error) {
        console.error('Error updating demo step:', error);
        return { success: false, error: error.message };
    }
};

export const deleteDemoStep = (stepId) => {
    try {
        let steps = getDemoSteps();
        steps = steps.filter(s => s.id !== stepId);

        // Reorder
        steps = steps.map((step, index) => ({
            ...step,
            order_index: index
        }));

        localStorage.setItem(DEMO_KEYS.STEPS, JSON.stringify(steps));
        return { success: true };
    } catch (error) {
        console.error('Error deleting demo step:', error);
        return { success: false, error: error.message };
    }
};

// ============ NOTES ============

export const getDemoNotes = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.NOTES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting demo notes:', error);
        return [];
    }
};

export const addDemoNote = (stepId, noteData, result) => {
    try {
        const notes = getDemoNotes();
        const newNote = {
            id: generateDemoId(),
            step_id: stepId,
            title: noteData.title || '',
            lesson_learned: noteData.lesson_learned || '',
            reflection_text: noteData.reflection_text || '',
            result: result === 'failed' ? 'failure' : result,
            created_at: new Date().toISOString(),
            ...noteData
        };

        notes.push(newNote);
        localStorage.setItem(DEMO_KEYS.NOTES, JSON.stringify(notes));
        return { success: true, note: newNote };
    } catch (error) {
        console.error('Error adding demo note:', error);
        return { success: false, error: error.message };
    }
};

export const updateDemoNote = (noteId, noteData, result) => {
    try {
        const notes = getDemoNotes();
        const noteIndex = notes.findIndex(n => n.id === noteId);

        if (noteIndex === -1) {
            return { success: false, error: 'Note not found' };
        }

        notes[noteIndex] = {
            ...notes[noteIndex],
            title: noteData.title || notes[noteIndex].title,
            lesson_learned: noteData.lesson_learned || notes[noteIndex].lesson_learned,
            reflection_text: noteData.reflection_text || notes[noteIndex].reflection_text,
            result: result === 'failed' ? 'failure' : result,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.NOTES, JSON.stringify(notes));
        return { success: true, note: notes[noteIndex] };
    } catch (error) {
        console.error('Error updating demo note:', error);
        return { success: false, error: error.message };
    }
};

export const deleteDemoNote = (noteId) => {
    try {
        let notes = getDemoNotes();
        notes = notes.filter(n => n.id !== noteId);
        localStorage.setItem(DEMO_KEYS.NOTES, JSON.stringify(notes));
        return { success: true };
    } catch (error) {
        console.error('Error deleting demo note:', error);
        return { success: false, error: error.message };
    }
};

export const getNotesForDemoStep = (stepId) => {
    try {
        const notes = getDemoNotes();
        return notes.filter(n => n.step_id === stepId);
    } catch (error) {
        console.error('Error getting notes for demo step:', error);
        return [];
    }
};

// ============ PRODUCT IMAGES ============

const MAX_PRODUCT_IMAGES = 3; // Limit for demo mode

export const getDemoProductImages = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.PRODUCT_IMAGES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting demo product images:', error);
        return [];
    }
};

export const addDemoProductImage = (imageData) => {
    try {
        const images = getDemoProductImages();

        // Enforce 3 image limit
        if (images.length >= MAX_PRODUCT_IMAGES) {
            return {
                success: false,
                error: `Maximum ${MAX_PRODUCT_IMAGES} product images allowed`,
                limitReached: true
            };
        }

        const newImage = {
            id: generateDemoId(),
            data: imageData.data, // base64 string
            name: imageData.name || 'Product Image',
            order_index: images.length,
            created_at: new Date().toISOString()
        };

        images.push(newImage);
        localStorage.setItem(DEMO_KEYS.PRODUCT_IMAGES, JSON.stringify(images));
        return { success: true, image: newImage };
    } catch (error) {
        console.error('Error adding demo product image:', error);
        return { success: false, error: error.message };
    }
};

export const deleteDemoProductImage = (imageId) => {
    try {
        let images = getDemoProductImages();
        images = images.filter(img => img.id !== imageId);

        // Reorder
        images = images.map((img, index) => ({
            ...img,
            order_index: index
        }));

        localStorage.setItem(DEMO_KEYS.PRODUCT_IMAGES, JSON.stringify(images));
        return { success: true };
    } catch (error) {
        console.error('Error deleting demo product image:', error);
        return { success: false, error: error.message };
    }
};

export const reorderDemoProductImages = (orderedIds) => {
    try {
        const images = getDemoProductImages();
        const reordered = orderedIds.map((id, index) => {
            const img = images.find(i => i.id === id);
            return img ? { ...img, order_index: index } : null;
        }).filter(Boolean);

        localStorage.setItem(DEMO_KEYS.PRODUCT_IMAGES, JSON.stringify(reordered));
        return { success: true, images: reordered };
    } catch (error) {
        console.error('Error reordering demo product images:', error);
        return { success: false, error: error.message };
    }
};

// ============ DEMO DATA MANAGEMENT ============

export const hasDemoData = () => {
    return !!(getDemoMountain() || getDemoSteps().length > 0);
};

export const getDemoDataForMigration = () => {
    return {
        mountain: getDemoMountain(),
        steps: getDemoSteps(),
        notes: getDemoNotes()
    };
};

export const clearDemoData = () => {
    try {
        localStorage.removeItem(DEMO_KEYS.MOUNTAIN);
        localStorage.removeItem(DEMO_KEYS.STEPS);
        localStorage.removeItem(DEMO_KEYS.NOTES);
        localStorage.removeItem(DEMO_KEYS.MILESTONES);
        localStorage.removeItem(DEMO_KEYS.CHECKINS);
        return { success: true };
    } catch (error) {
        console.error('Error clearing demo data:', error);
        return { success: false, error: error.message };
    }
};

// ============ LOCK MILESTONES ============

export const getDemoMilestones = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.MILESTONES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting demo milestones:', error);
        return [];
    }
};

export const saveDemoMilestones = (milestones) => {
    try {
        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(milestones));
        return { success: true, milestones };
    } catch (error) {
        console.error('Error saving demo milestones:', error);
        return { success: false, error: error.message };
    }
};

export const addDemoMilestone = (milestoneData) => {
    try {
        const milestones = getDemoMilestones();
        const mountain = getDemoMountain();

        if (milestones.length >= MAX_DEMO_MILESTONES) {
            return { success: false, error: 'Maximum milestones reached', limitReached: true };
        }

        const newMilestone = {
            id: generateDemoId(),
            mountain_id: mountain?.id || 'demo_mountain',
            user_id: 'demo_user',
            target_value: milestoneData.target_value,
            title: milestoneData.title,
            commitment: milestoneData.commitment || null,
            reward: milestoneData.reward || null,
            icon_emoji: milestoneData.icon_emoji || '🎯',
            theme_color: milestoneData.theme_color || '#E7C778',
            is_unlocked: milestoneData.is_unlocked || false,
            unlocked_at: milestoneData.unlocked_at || null,
            unlocked_value: milestoneData.unlocked_value || null,
            sort_order: milestoneData.sort_order ?? milestones.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        milestones.push(newMilestone);
        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(milestones));
        return { success: true, milestone: newMilestone };
    } catch (error) {
        console.error('Error adding demo milestone:', error);
        return { success: false, error: error.message };
    }
};

export const addDemoMilestonesBatch = (milestonesData) => {
    try {
        const mountain = getDemoMountain();
        const newMilestones = milestonesData.map((m, index) => ({
            id: generateDemoId(),
            mountain_id: mountain?.id || 'demo_mountain',
            user_id: 'demo_user',
            target_value: m.target_value,
            title: m.title,
            commitment: m.commitment || null,
            consequence: m.consequence || null,
            reward: m.reward || null,
            icon_emoji: m.icon_emoji || '🎯',
            theme_color: m.theme_color || '#E7C778',
            is_unlocked: m.is_unlocked || false,
            unlocked_at: m.unlocked_at || null,
            unlocked_value: m.unlocked_value || null,
            is_broken: m.is_broken || false,
            broken_at: m.broken_at || null,
            broken_reason: m.broken_reason || null,
            deadline: m.deadline || null,
            milestone_type: m.milestone_type || 'value',
            task_description: m.task_description || null,
            sort_order: m.sort_order ?? index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(newMilestones));
        return { success: true, milestones: newMilestones };
    } catch (error) {
        console.error('Error adding demo milestones batch:', error);
        return { success: false, error: error.message };
    }
};

export const updateDemoMilestone = (milestoneId, updates) => {
    try {
        const milestones = getDemoMilestones();
        const index = milestones.findIndex(m => m.id === milestoneId);

        if (index === -1) {
            return { success: false, error: 'Milestone not found' };
        }

        milestones[index] = {
            ...milestones[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(milestones));
        return { success: true, milestone: milestones[index] };
    } catch (error) {
        console.error('Error updating demo milestone:', error);
        return { success: false, error: error.message };
    }
};

export const deleteDemoMilestone = (milestoneId) => {
    try {
        let milestones = getDemoMilestones();
        milestones = milestones.filter(m => m.id !== milestoneId);
        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(milestones));

        // Also delete associated check-ins
        let checkins = getDemoCheckins();
        checkins = checkins.filter(c => c.milestone_id !== milestoneId);
        localStorage.setItem(DEMO_KEYS.CHECKINS, JSON.stringify(checkins));

        return { success: true };
    } catch (error) {
        console.error('Error deleting demo milestone:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check and unlock milestones when progress updates
 */
export const checkAndUnlockDemoMilestones = (currentValue) => {
    try {
        const milestones = getDemoMilestones();
        const newlyUnlocked = [];

        const updatedMilestones = milestones.map(m => {
            if (m.is_unlocked || currentValue < m.target_value) {
                return m;
            }

            // Unlock this milestone!
            const unlocked = {
                ...m,
                is_unlocked: true,
                unlocked_at: new Date().toISOString(),
                unlocked_value: currentValue,
                updated_at: new Date().toISOString()
            };

            newlyUnlocked.push(unlocked);
            return unlocked;
        });

        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
        return { success: true, milestones: updatedMilestones, newlyUnlocked };
    } catch (error) {
        console.error('Error checking milestone unlocks:', error);
        return { success: false, error: error.message, newlyUnlocked: [] };
    }
};

/**
 * Get the current (next unlockable) milestone
 */
export const getCurrentDemoMilestone = () => {
    const milestones = getDemoMilestones();
    const sorted = [...milestones].sort((a, b) => a.target_value - b.target_value);
    return sorted.find(m => !m.is_unlocked && !m.is_broken) || null;
};

/**
 * Mark a demo milestone as broken (promise failed)
 */
export const markDemoMilestoneBroken = (milestoneId, reason = null) => {
    try {
        const milestones = getDemoMilestones();
        const index = milestones.findIndex(m => m.id === milestoneId);

        if (index === -1) {
            return { success: false, error: 'Milestone not found' };
        }

        milestones[index] = {
            ...milestones[index],
            is_broken: true,
            broken_at: new Date().toISOString(),
            broken_reason: reason,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(milestones));
        return { success: true, milestone: milestones[index] };
    } catch (error) {
        console.error('Error marking demo milestone as broken:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check for expired deadlines in demo mode
 */
export const checkExpiredDemoDeadlines = () => {
    try {
        const milestones = getDemoMilestones();
        const now = new Date();
        const expiredMilestones = [];

        const updatedMilestones = milestones.map(m => {
            if (m.is_unlocked || m.is_broken || !m.deadline) {
                return m;
            }

            const deadline = new Date(m.deadline);
            if (deadline < now) {
                const expired = {
                    ...m,
                    is_broken: true,
                    broken_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                expiredMilestones.push(expired);
                return expired;
            }

            return m;
        });

        if (expiredMilestones.length > 0) {
            localStorage.setItem(DEMO_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
        }

        return { success: true, expiredMilestones };
    } catch (error) {
        console.error('Error checking expired demo deadlines:', error);
        return { success: false, error: error.message, expiredMilestones: [] };
    }
};

// ============ DAILY CHECK-INS ============

export const getDemoCheckins = () => {
    try {
        const data = localStorage.getItem(DEMO_KEYS.CHECKINS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting demo check-ins:', error);
        return [];
    }
};

export const getCheckinsForMilestone = (milestoneId) => {
    return getDemoCheckins().filter(c => c.milestone_id === milestoneId);
};

export const upsertDemoCheckin = (milestoneId, date, keptPromise, note = null) => {
    try {
        const checkins = getDemoCheckins();
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

        // Find existing check-in for this milestone + date
        const existingIndex = checkins.findIndex(
            c => c.milestone_id === milestoneId && c.checkin_date === dateStr
        );

        const checkinData = {
            id: existingIndex >= 0 ? checkins[existingIndex].id : generateDemoId(),
            milestone_id: milestoneId,
            user_id: 'demo_user',
            checkin_date: dateStr,
            kept_promise: keptPromise,
            note: note,
            created_at: existingIndex >= 0 ? checkins[existingIndex].created_at : new Date().toISOString()
        };

        if (existingIndex >= 0) {
            checkins[existingIndex] = checkinData;
        } else {
            checkins.push(checkinData);
        }

        localStorage.setItem(DEMO_KEYS.CHECKINS, JSON.stringify(checkins));
        return { success: true, checkin: checkinData };
    } catch (error) {
        console.error('Error upserting demo check-in:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Calculate streak stats for a milestone
 */
export const getDemoMilestoneStreak = (milestoneId) => {
    const checkins = getCheckinsForMilestone(milestoneId);

    if (checkins.length === 0) {
        return {
            current_streak: 0,
            longest_streak: 0,
            total_days: 0,
            kept_days: 0,
            slip_days: 0,
            commitment_rate: 0
        };
    }

    // Sort by date descending
    const sorted = [...checkins].sort((a, b) =>
        new Date(b.checkin_date) - new Date(a.checkin_date)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from most recent)
    for (const checkin of sorted) {
        if (checkin.kept_promise) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculate longest streak
    for (const checkin of sorted) {
        if (checkin.kept_promise) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    }

    const totalDays = checkins.length;
    const keptDays = checkins.filter(c => c.kept_promise).length;
    const slipDays = totalDays - keptDays;
    const commitmentRate = totalDays > 0 ? Math.round((keptDays / totalDays) * 100) : 0;

    return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_days: totalDays,
        kept_days: keptDays,
        slip_days: slipDays,
        commitment_rate: commitmentRate
    };
};

export const isDemoMode = (user) => {
    // Demo mode if no user AND has demo data OR explicitly in demo
    return !user && hasDemoData();
};

// Initialize demo mountain if none exists
export const initializeDemoMountain = () => {
    if (!getDemoMountain()) {
        return saveDemoMountain({
            title: 'My First Mountain',
            target: '$1k MRR',
            total_steps_planned: 10
        });
    }
    return getDemoMountain();
};

// ============ INSPIRING PRE-POPULATED DEMO ============

/**
 * Pre-populate demo with an inspiring founder journey
 * Shows what a real build-in-public journey looks like
 */
export const initializeInspiringDemo = () => {
    // Only initialize if no existing demo data
    if (hasDemoData()) {
        return { alreadyExists: true };
    }

    // Create an inspiring SaaS journey - Day 47
    // Note: Metric tracking fields start as null - user sets up via MetricProgressModal
    const mountain = saveDemoMountain({
        title: '$10K MRR Journey',
        target: '$10,000 MRR',
        total_steps_planned: 6,
        // Metric fields start null (step-based progress by default)
        target_value: null,
        current_value: 0,
        metric_prefix: '',
        metric_suffix: '',
        progress_history: [],
        created_at: new Date(Date.now() - 47 * 24 * 60 * 60 * 1000).toISOString() // 47 days ago
    });

    // Pre-populate with realistic founder steps
    const demoSteps = [
        {
            id: 'demo_step_1',
            mountain_id: mountain.id,
            title: 'Validate Problem',
            description: 'Talk to 10 potential customers',
            expected_outcome: 'Confirm pain point exists',
            status: 'success',
            order_index: 0,
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_step_2',
            mountain_id: mountain.id,
            title: 'Build MVP',
            description: 'Ship core feature in 2 weeks',
            expected_outcome: 'Working prototype',
            status: 'success',
            order_index: 1,
            created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_step_3',
            mountain_id: mountain.id,
            title: 'First 10 Users',
            description: 'Get beta testers via Twitter',
            expected_outcome: '10 active beta users',
            status: 'success',
            order_index: 2,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_step_4',
            mountain_id: mountain.id,
            title: 'Product Hunt Launch',
            description: 'Prep and launch on PH',
            expected_outcome: 'Top 10 of the day',
            status: 'failed',
            order_index: 3,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_step_5',
            mountain_id: mountain.id,
            title: 'Iterate & Relaunch',
            description: 'Fix issues, try again',
            expected_outcome: 'Better launch',
            status: 'success',
            order_index: 4,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_step_6',
            mountain_id: mountain.id,
            title: 'Reach $1K MRR',
            description: 'Convert users to paid',
            expected_outcome: '$1,000 monthly recurring',
            status: 'pending',
            order_index: 5,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    localStorage.setItem(DEMO_KEYS.STEPS, JSON.stringify(demoSteps));

    // Pre-populate with inspiring lessons/notes
    const demoNotes = [
        {
            id: 'demo_note_1',
            step_id: 'demo_step_1',
            title: 'Problem validated!',
            lesson_learned: '8 out of 10 founders said they waste 2+ hours/week manually creating social content. Pain is real.',
            reflection_text: 'Cold DMs on Twitter work better than I expected. 30% response rate!',
            result: 'success',
            created_at: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_2',
            step_id: 'demo_step_2',
            title: 'MVP shipped in 12 days',
            lesson_learned: 'Scope creep is real. Cut 3 features to ship on time. Users only needed the core export feature.',
            reflection_text: 'Perfect is the enemy of shipped. The MVP was ugly but functional.',
            result: 'success',
            created_at: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_3',
            step_id: 'demo_step_3',
            title: 'First users from #buildinpublic',
            lesson_learned: 'Sharing the journey itself attracted users. Day 7 tweet got 50K impressions and 15 signups.',
            reflection_text: 'The #buildinpublic community is incredibly supportive. Transparency builds trust.',
            result: 'success',
            created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_4',
            step_id: 'demo_step_4',
            title: 'PH launch flopped - #23',
            lesson_learned: 'Launched on a Tuesday thinking less competition. Wrong. Thursday/Tuesday launches need MORE prep, not less.',
            reflection_text: 'Should have built more hunter relationships first. Got featured but no momentum.',
            result: 'failure',
            created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_5',
            step_id: 'demo_step_4',
            title: 'Key insight from failure',
            lesson_learned: 'PH success = 70% community, 30% product. I focused too much on product polish.',
            reflection_text: 'Next time: spend 2 weeks building launch community BEFORE launch day.',
            result: 'failure',
            created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_6',
            step_id: 'demo_step_5',
            title: 'Soft relaunch worked!',
            lesson_learned: 'Instead of big launch, did 20 small posts over 2 weeks. Consistent > viral.',
            reflection_text: 'Daily "Day X" posts built anticipation. People started following the journey.',
            result: 'success',
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'demo_note_7',
            step_id: 'demo_step_5',
            title: 'First paying customer!',
            lesson_learned: 'Customer said "I saw your Day 30 post and knew you were serious." Consistency = credibility.',
            reflection_text: '$49/month feels small but proves people will pay. Time to scale.',
            result: 'success',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    localStorage.setItem(DEMO_KEYS.NOTES, JSON.stringify(demoNotes));

    return {
        success: true,
        mountain,
        steps: demoSteps,
        notes: demoNotes
    };
};

/**
 * Force reset demo to inspiring data (for testing)
 */
export const resetToInspiringDemo = () => {
    clearDemoData();
    return initializeInspiringDemo();
};
