import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MountainProvider, useMountain } from './context/MountainContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Lessons from './pages/Lessons'
import GoalSetup from './pages/GoalSetup'
import Pricing from './pages/Pricing'
import Admin from './pages/Admin'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import Settings from './pages/Settings'

/**
 * Protected Route - Requires authentication
 * Redirects to /auth if not logged in
 */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return children
}

/**
 * Setup Route - Redirects to dashboard if user already has a mountain
 */
function SetupRoute({ children }) {
    const { user, loading: authLoading } = useAuth()
    const { hasMountain, loading: mountainLoading } = useMountain()

    if (authLoading || mountainLoading) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    // If user already has a mountain, go to dashboard
    if (hasMountain) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

/**
 * Dashboard Route - Allows demo mode OR authenticated users with mountain
 * Demo users (no auth) can access directly
 * Authenticated users without mountain are redirected to setup
 */
function DashboardRoute({ children }) {
    const { user, loading: authLoading } = useAuth()
    const { hasMountain, loading: mountainLoading, isDemoMode } = useMountain()

    if (authLoading || mountainLoading) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    // DEMO MODE: Allow anonymous users (they'll get demo mountain auto-created)
    if (!user) {
        return children
    }

    // AUTHENTICATED MODE: If user has no mountain, go to setup
    if (!hasMountain) {
        return <Navigate to="/setup" replace />
    }

    return children
}

export default function App() {
    return (
        <AuthProvider>
            <MountainProvider>
                <ThemeProvider>
                    <ToastProvider>
                    <BrowserRouter>
                        <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Landing />} />
                            <Route path="auth" element={<Auth />} />
                            <Route path="setup" element={
                                <SetupRoute>
                                    <GoalSetup />
                                </SetupRoute>
                            } />
                            <Route path="dashboard" element={
                                <DashboardRoute>
                                    <Dashboard />
                                </DashboardRoute>
                            } />
                            <Route path="profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                            <Route path="lessons" element={<Lessons />} />
                            <Route path="pricing" element={<Pricing />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="payment-success" element={
                                <ProtectedRoute>
                                    <PaymentSuccess />
                                </ProtectedRoute>
                            } />
                            <Route path="payment-cancel" element={
                                <ProtectedRoute>
                                    <PaymentCancel />
                                </ProtectedRoute>
                            } />
                        </Route>

                            {/* Admin Route - Isolated from Layout */}
                            <Route path="admin" element={
                                <ProtectedRoute>
                                    <Admin />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
                </ThemeProvider>
            </MountainProvider>
        </AuthProvider>
    )
}
