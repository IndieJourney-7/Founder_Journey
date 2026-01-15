/**
 * Path Utilities for Mountain Journey
 *
 * Calculates positions along the bezier path for milestone markers.
 * Used to place lock icons at the correct positions on the mountain.
 */

// Sample points along the mountain path curve (converted to % of 1440x900 viewBox)
// These match the bezier curve: M200 850 C 350 850, 450 750, 500 650...
const CURVE_POINTS = [
    { x: 13.8, y: 94.4 },  // 0% - Base of mountain
    { x: 24.3, y: 88.8 },  // ~9%
    { x: 31.2, y: 77.7 },  // ~18%
    { x: 34.7, y: 72.2 },  // ~27%
    { x: 36.4, y: 66.6 },  // ~36%
    { x: 38.2, y: 61.1 },  // ~45%
    { x: 41.6, y: 50.0 },  // ~54%
    { x: 52.1, y: 46.6 },  // ~63%
    { x: 62.5, y: 50.0 },  // ~72%
    { x: 69.4, y: 44.4 },  // ~81%
    { x: 76.4, y: 33.3 },  // ~90%
    { x: 83.3, y: 27.7 }   // 100% - Summit
]

/**
 * Get position on the path based on progress percentage (0-100)
 * Uses linear interpolation between curve sample points
 *
 * @param {number} progressPercent - Progress from 0 to 100
 * @returns {{ x: string, y: string }} Position as CSS percentage values
 */
export const getPositionOnPath = (progressPercent) => {
    const effectiveProgress = Math.max(0, Math.min(100, progressPercent))
    const totalPoints = CURVE_POINTS.length - 1
    const currentPointIndex = Math.min(
        Math.floor((effectiveProgress / 100) * totalPoints),
        totalPoints - 1
    )
    const nextPointIndex = Math.min(currentPointIndex + 1, totalPoints)
    const segmentProgress = ((effectiveProgress / 100) * totalPoints) - currentPointIndex

    const current = CURVE_POINTS[currentPointIndex]
    const next = CURVE_POINTS[nextPointIndex]

    const x = current.x + (next.x - current.x) * segmentProgress
    const y = current.y + (next.y - current.y) * segmentProgress

    return { x: `${x}%`, y: `${y}%` }
}

/**
 * Get position for a milestone based on its target value relative to journey target
 *
 * @param {Object} milestone - Milestone object with target_value
 * @param {number} journeyTargetValue - The total journey target value
 * @returns {{ x: string, y: string }} Position as CSS percentage values
 */
export const getMilestonePosition = (milestone, journeyTargetValue) => {
    if (!journeyTargetValue || journeyTargetValue === 0) {
        return { x: '50%', y: '50%' }
    }
    const progressPercent = (milestone.target_value / journeyTargetValue) * 100
    return getPositionOnPath(progressPercent)
}

/**
 * Get position for a milestone based on its index in the array
 * Useful for time-based milestones that don't have target values
 *
 * @param {number} index - Index of the milestone (0-based)
 * @param {number} totalMilestones - Total number of milestones
 * @returns {{ x: string, y: string }} Position as CSS percentage values
 */
export const getMilestonePositionByIndex = (index, totalMilestones) => {
    if (totalMilestones <= 1) {
        return getPositionOnPath(50) // Center if only one milestone
    }
    // Distribute milestones evenly along the path (10% to 95%)
    const startPercent = 10
    const endPercent = 95
    const range = endPercent - startPercent
    const progressPercent = startPercent + (index / (totalMilestones - 1)) * range
    return getPositionOnPath(progressPercent)
}

/**
 * Get evenly distributed positions for N milestones along the path
 *
 * @param {number} count - Number of milestones
 * @returns {Array<{ x: string, y: string }>} Array of positions
 */
export const getDistributedPositions = (count) => {
    const positions = []
    for (let i = 0; i < count; i++) {
        positions.push(getMilestonePositionByIndex(i, count))
    }
    return positions
}

/**
 * Calculate time remaining until deadline
 *
 * @param {string|Date} deadline - Deadline timestamp
 * @returns {{ hours: number, minutes: number, seconds: number, total: number, isExpired: boolean }}
 */
export const getTimeRemaining = (deadline) => {
    const deadlineTime = new Date(deadline).getTime()
    const now = Date.now()
    const total = deadlineTime - now

    if (total <= 0) {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: 0,
            isExpired: true
        }
    }

    return {
        hours: Math.floor(total / (1000 * 60 * 60)),
        minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((total % (1000 * 60)) / 1000),
        total,
        isExpired: false
    }
}

/**
 * Format time remaining as HH:MM:SS string
 *
 * @param {string|Date} deadline - Deadline timestamp
 * @returns {string} Formatted time string like "17:24:08"
 */
export const formatTimeRemaining = (deadline) => {
    const time = getTimeRemaining(deadline)
    if (time.isExpired) {
        return 'EXPIRED'
    }
    const pad = (n) => n.toString().padStart(2, '0')
    return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`
}

/**
 * Format deadline as human-readable string
 *
 * @param {string|Date} deadline - Deadline timestamp
 * @returns {string} Formatted string like "Today, 9:00 PM" or "Tomorrow, 7:00 PM"
 */
export const formatDeadline = (deadline) => {
    const date = new Date(deadline)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${timeStr}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${timeStr}`
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }
}

export default {
    getPositionOnPath,
    getMilestonePosition,
    getMilestonePositionByIndex,
    getDistributedPositions,
    getTimeRemaining,
    formatTimeRemaining,
    formatDeadline
}
