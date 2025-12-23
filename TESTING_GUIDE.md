# Testing Guide - Lesson Management Feature

## What We've Built So Far (40% Complete)

### ✅ Completed Components:

1. **Database Migration**
   - Added `title` field to `journey_notes` table
   - Max 60 characters, required field
   - Existing notes auto-generated titles

2. **notesService.js**
   - `createJourneyNote()` - Create new lesson with title
   - `updateJourneyNote()` - Edit existing lesson
   - `fetchNotesForStep()` - Get all lessons for a step
   - `deleteJourneyNote()` - Delete a lesson

3. **StepDetailModal Component**
   - Beautiful modal UI for managing lessons
   - Add multiple lessons per step
   - Edit/delete existing lessons
   - Form validation (title required)
   - Success/Failed toggle

---

## How to Test (Manual Integration Needed)

### 🔴 IMPORTANT: Component is NOT wired yet!

The `StepDetailModal` component exists but is **not connected** to your mountain dashboard yet.

To test it, you need to:

### Option 1: Quick Test (Temporary)

Add this to your Dashboard.jsx to test the modal:

```jsx
import StepDetailModal from '../components/mountain/StepDetailModal';

// Inside Dashboard component:
const [testModalOpen, setTestModalOpen] = useState(false);
const [testStep, setTestStep] = useState(null);

// In your JSX, add a test button:
<button onClick={() => {
    setTestStep(steps[0]); // Use first step
    setTestModalOpen(true);
}}>
    Test Lesson Modal
</button>

<StepDetailModal
    step={testStep}
    isOpen={testModalOpen}
    onClose={() => setTestModalOpen(false)}
    onUpdate={() => {
        // Reload your notes here
        console.log('Lessons updated!');
    }}
/>
```

### Option 2: Full Integration (Recommended)

Wait for Phase 3 where I'll:
- Update StickyNote to show lesson count
- Wire click handler to open StepDetailModal
- Group notes by step properly

---

## What to Test Once Wired:

### Test 1: Add Multiple Lessons to One Step
1. Click a sticky note on mountain
2. Modal opens showing step details
3. Click "Add Lesson"
4. Fill in:
   - Title: "Keep it simple" (required)
   - What did you learn: "Users don't want 50 features"
   - What happened: "Showed MVP to 10 users"
   - Result: Success/Failed
5. Click "Add Lesson"
6. Lesson appears in list
7. Click "Add Another Lesson" and repeat
8. Should see 2+ lessons for same step

### Test 2: Edit Lesson
1. Click edit button (pencil icon) on any lesson
2. Form appears with pre-filled data
3. Change title to "Simplicity wins"
4. Click "Save Changes"
5. Lesson updates immediately

### Test 3: Delete Lesson
1. Click delete button (trash icon)
2. Confirmation dialog appears
3. Click OK
4. Lesson removed from list

### Test 4: Title Validation
1. Try to add lesson with empty title
2. Should show error: "Please enter a lesson title"
3. Try 61+ character title
4. Should truncate to 60 characters

### Test 5: Success vs Failed
1. Add lesson with "Success" result → Green tint
2. Add lesson with "Failed" result → Amber tint
3. Both should display correctly

---

## Known Limitations (To Be Fixed in Phase 3-5):

❌ StickyNote still shows single note (not lesson count)
❌ Clicking sticky note doesn't open StepDetailModal yet
❌ Lessons page not redesigned (still flat list)
❌ No share button functionality yet
❌ Mountain context doesn't group notes by step yet

---

## Database Verification:

Check your Supabase table to verify data:

```sql
-- See all lessons with titles
SELECT id, title, lesson_learned, step_id, created_at
FROM journey_notes
ORDER BY step_id, created_at;

-- Count lessons per step
SELECT step_id, COUNT(*) as lesson_count
FROM journey_notes
GROUP BY step_id;
```

---

## Next Implementation Steps:

### Phase 3: Wire StepDetailModal (20 mins)
- Update MountainDashboard to open modal on sticky note click
- Group notes by step
- Show lesson count on sticky notes

### Phase 4: Redesign Lessons Page (40 mins)
- Group lessons by step
- Add share buttons
- Show step context

### Phase 5: Create LessonCardExport (45 mins)
- Similar to MinimalBannerExport
- Quote-card style
- Social media formats

---

## If You Want to Continue Implementation:

Just say **"continue"** and I'll wire up Phase 3 (integrate StepDetailModal with the mountain).

Or if you want to test the component in isolation first, use Option 1 above!
