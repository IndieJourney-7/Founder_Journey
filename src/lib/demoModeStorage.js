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
    PRODUCT_IMAGES: 'shift_demo_product_images'
};

const MAX_DEMO_STEPS = 6; // Match free tier limit

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
        return { success: true };
    } catch (error) {
        console.error('Error clearing demo data:', error);
        return { success: false, error: error.message };
    }
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
