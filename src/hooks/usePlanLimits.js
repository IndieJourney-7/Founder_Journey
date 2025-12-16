import { useAuth } from '../context/AuthContext';
import { useMountain } from '../context/MountainContext';

export const usePlanLimits = () => {
    const { user } = useAuth();
    const { mountains, steps, stickyNotes, currentMountain } = useMountain();

    // Default to free if no user or plan not set
    const isPro = user?.user_metadata?.plan_type === 'pro';

    const limits = {
        maxMountains: 1, // Strict limit for MVP/First Launch
        maxStepsPerMountain: isPro ? Infinity : 6,
        maxStickyNotes: isPro ? Infinity : Infinity, // Removing limit on notes for now as per instructions (unlimited notes implies unlimited, but instructions said 'Up to 6 planned steps' and 'Success & failure notes', didn't specify note limit, but 'Unlimited steps & notes for Pro' implies limit. Let's stick to step limit being the constraint)
        // Actually instructions said: Free: "Success & failure notes", Pro: "Unlimited steps & notes". 
        // Logic: You can add notes to any existing step. Step limit constrains notes indirectly.
        maxShares: isPro ? Infinity : 4,
        canExport: true, // Everyone can export, but free has limits
        canShare: true, // Everyone can share, but free has limits
    };

    const checkLimit = (feature) => {
        switch (feature) {
            case 'add_mountain':
                return mountains ? mountains.length < limits.maxMountains : true;
            case 'add_step':
                return steps.length < limits.maxStepsPerMountain;
            case 'export':
                // For export/share, we allow it but check count in the UI for free users
                // This checkLimit is mostly for "Can I open the modal?"
                // We always allow opening the modal now to show the limit or watermark
                return true;
            case 'share_count':
                // Specific check for share limit
                if (isPro) return true;
                const shareCount = currentMountain?.share_count || 0;
                return shareCount < limits.maxShares;
            default:
                return true;
        }
    };

    return {
        isPro,
        limits,
        checkLimit
    };
};
