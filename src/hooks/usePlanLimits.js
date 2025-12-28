import { useAuth } from '../context/AuthContext';
import { useMountain } from '../context/MountainContext';

/**
 * Plan Limits Hook
 *
 * Strategy: "Open Playground, Gated Publishing"
 * - FREE: Unlimited building (steps, notes, journey)
 * - PAID: Unlimited sharing (no watermark, no limits, public URL)
 *
 * This creates a natural upgrade trigger when users want to SHARE their progress.
 */
export const usePlanLimits = () => {
    const { user } = useAuth();
    const { mountains, steps, currentMountain } = useMountain();

    // Default to free if no user or plan not set
    const isPro = user?.user_metadata?.plan_type === 'pro';

    const limits = {
        // Building - FREE & UNLIMITED (let them fall in love with the product)
        maxMountains: 1,
        maxStepsPerMountain: Infinity,  // Unlimited steps for everyone
        maxStickyNotes: Infinity,        // Unlimited notes for everyone
        maxProductImages: isPro ? Infinity : 3,

        // Sharing - GATED (this is where we monetize)
        maxSharesPerMonth: isPro ? Infinity : 3,  // 3 shares/month for free
        hasWatermark: !isPro,                      // Free = watermark on exports
        hasPublicProfile: isPro,                   // Pro = yourname.shiftjourney.com
        hasViralTemplates: isPro,                  // Pro = advanced tweet templates
        hasHDExport: isPro,                        // Pro = high quality exports
        hasAllThemes: isPro,                       // Pro = all premium themes
    };

    // Get current month's share count from localStorage or mountain
    const getMonthlyShareCount = () => {
        const now = new Date();
        const monthKey = `shares_${now.getFullYear()}_${now.getMonth()}`;
        const stored = localStorage.getItem(monthKey);
        return stored ? parseInt(stored, 10) : 0;
    };

    const incrementShareCount = () => {
        const now = new Date();
        const monthKey = `shares_${now.getFullYear()}_${now.getMonth()}`;
        const current = getMonthlyShareCount();
        localStorage.setItem(monthKey, (current + 1).toString());
        return current + 1;
    };

    const checkLimit = (feature) => {
        switch (feature) {
            case 'add_mountain':
                return mountains ? mountains.length < limits.maxMountains : true;

            case 'add_step':
                // Always allow - unlimited for everyone
                return true;

            case 'add_note':
                // Always allow - unlimited for everyone
                return true;

            case 'add_product_image':
                // Check product image limit (3 for free)
                const currentImages = currentMountain?.product_images?.length || 0;
                return currentImages < limits.maxProductImages;

            case 'share':
                // Check monthly share limit
                if (isPro) return true;
                return getMonthlyShareCount() < limits.maxSharesPerMonth;

            case 'share_without_watermark':
                return isPro;

            case 'public_profile':
                return isPro;

            case 'hd_export':
                return isPro;

            default:
                return true;
        }
    };

    // Get remaining shares this month
    const getRemainingShares = () => {
        if (isPro) return Infinity;
        return Math.max(0, limits.maxSharesPerMonth - getMonthlyShareCount());
    };

    return {
        isPro,
        limits,
        checkLimit,
        getMonthlyShareCount,
        incrementShareCount,
        getRemainingShares,
        hasWatermark: limits.hasWatermark
    };
};
