/**
 * Production-Safe Logger
 *
 * In development: All logs are shown
 * In production: Only errors are shown (console.log hidden for performance)
 *
 * Usage:
 *   import { logger } from './lib/logger'
 *   logger.log('Debug info')     // Hidden in production
 *   logger.error('Error message') // Always shown
 *   logger.warn('Warning')        // Hidden in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    /**
     * Debug/Info logs - Only in development
     * Use for debugging, tracing, general information
     */
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Error logs - Always shown (even in production)
     * Use for actual errors that need attention
     */
    error: (...args) => {
        console.error(...args);
        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // if (!isDevelopment) {
        //     Sentry.captureException(args[0]);
        // }
    },

    /**
     * Warning logs - Only in development
     * Use for deprecations, potential issues
     */
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    /**
     * Debug logs - Only in development
     * Use for detailed debugging information
     */
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    /**
     * Info logs - Only in development
     * Use for general information
     */
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    /**
     * Table logs - Only in development
     * Use for displaying tabular data
     */
    table: (...args) => {
        if (isDevelopment) {
            console.table(...args);
        }
    },

    /**
     * Group logs - Only in development
     * Use for grouping related log messages
     */
    group: (label) => {
        if (isDevelopment) {
            console.group(label);
        }
    },

    groupEnd: () => {
        if (isDevelopment) {
            console.groupEnd();
        }
    }
};

// Export isDevelopment for conditional logic elsewhere
export { isDevelopment };
