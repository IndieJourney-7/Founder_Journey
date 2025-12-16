/**
 * Authentication Service
 * 
 * Handles all Supabase Auth operations:
 * - Sign up with email/password
 * - Sign in with email/password
 * - Sign in with Google OAuth
 * - Sign out
 * - Get current user
 * - Listen to auth state changes
 */

import { supabase } from './supabase'

/**
 * Sign up a new user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        console.error('Signup error:', error.message)
        return { user: null, error }
    }

    return { user: data.user, error: null }
}

/**
 * Sign in an existing user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error('Login error:', error.message)
        return { user: null, error }
    }

    return { user: data.user, error: null }
}

/**
 * Sign in with Google OAuth
 * @returns {Promise<{error: object|null}>}
 */
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`
        }
    })

    if (error) {
        console.error('Google login error:', error.message)
        return { error }
    }

    return { error: null }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: object|null}>}
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error.message)
    }

    return { error }
}

/**
 * Get the currently authenticated user
 * @returns {Promise<object|null>}
 */
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get the current session
 * @returns {Promise<object|null>}
 */
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with (event, session) on auth changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return () => subscription.unsubscribe()
}

