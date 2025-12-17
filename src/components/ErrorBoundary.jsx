import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents the entire app from crashing with a white screen
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('🚨 Error Boundary Caught:', error);
        console.error('Error Info:', errorInfo);

        // Store error details in state
        this.state = {
            hasError: true,
            error: error,
            errorInfo: errorInfo
        };

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F1F3D] to-[#0a1529] p-4">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl">⚠️</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-white/70 mb-8 text-sm sm:text-base">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-brand-gold text-brand-blue rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors border border-white/20"
                            >
                                Go to Home
                            </button>
                        </div>

                        {/* Error Details (Development Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-red-400 cursor-pointer text-sm font-mono mb-2">
                                    Show Error Details (Dev Only)
                                </summary>
                                <div className="bg-black/40 border border-red-500/30 rounded-lg p-4 text-xs font-mono text-red-300 overflow-auto max-h-64">
                                    <p className="font-bold mb-2">{this.state.error.toString()}</p>
                                    <pre className="whitespace-pre-wrap text-red-200/70">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
