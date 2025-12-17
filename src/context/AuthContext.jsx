/**
 * Auth Context
 * 
 * Provides authentication state and methods throughout the app.
 * Uses Supabase Auth for email/password and Google OAuth authentication.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as authService from '../lib/auth'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setUser(session?.user ?? null);
            })
            .catch((error) => {
                console.error('Auth session fetch error:', error);
                setUser(null);
                setError('Failed to load session. Please refresh the page.');
            })
            .finally(() => {
                setLoading(false);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [])

    /**
     * Sign up with email and password
     */
    const signUp = async (email, password) => {
        setError(null)
        const { user: newUser, error: signUpError } = await authService.signUp(email, password)

        if (signUpError) {
            setError(signUpError.message)
            return { success: false, error: signUpError }
        }

        return { success: true, user: newUser }
    }

    /**
     * Sign in with email and password
     */
    const signIn = async (email, password) => {
        setError(null)
        const { user: loggedUser, error: signInError } = await authService.signIn(email, password)

        if (signInError) {
            setError(signInError.message)
            return { success: false, error: signInError }
        }

        return { success: true, user: loggedUser }
    }

    /**
     * Sign in with Google OAuth
     */
    const signInWithGoogle = async () => {
        setError(null)
        const { error: googleError } = await authService.signInWithGoogle()

        if (googleError) {
            setError(googleError.message)
            return { success: false, error: googleError }
        }

        return { success: true }
    }

    /**
     * Sign out
     */
    const signOut = async () => {
        setError(null)
        const { error: signOutError } = await authService.signOut()

        if (signOutError) {
            setError(signOutError.message)
            return { success: false, error: signOutError }
        }

        return { success: true }
    }

    /**
     * Refresh user session
     */
    const refreshUser = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Refresh user error:', sessionError);
                throw sessionError;
            }

            setUser(session?.user ?? null);
            return session?.user;
        } catch (error) {
            console.error('Failed to refresh user session:', error);
            setUser(null);
            setError('Failed to refresh session');
            return null;
        }
    }

    const value = {
        user,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshUser,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value} >
            {!loading && children
            }
        </AuthContext.Provider >
    )
}

