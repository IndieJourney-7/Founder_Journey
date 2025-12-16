import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, MessageSquare, Calendar, Loader, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'admin@sfht.com'

export default function Admin() {
    const { user, signOut, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [waitlist, setWaitlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (authLoading) return

        // Simple Client-Side Gate
        if (!user) {
            navigate('/auth')
            return
        }

        if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            // Don't redirect, show error to debug
            setError(`Access Denied: Logged in as ${user.email}, but need ${ADMIN_EMAIL}`)
            setLoading(false)
            return
        }

        fetchData()
    }, [user, authLoading, navigate])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('pro_waitlist')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setWaitlist(data)
        } catch (err) {
            console.error('Admin fetch error:', err)
            setError(err.message) // Likely RLS error if policy not set
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0F1F3D] flex items-center justify-center text-white">
                <Loader className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F1F3D] text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Shield className="text-brand-gold" size={24} />
                                Mission Control
                            </h1>
                            <p className="text-white/50 text-sm">Admin Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold text-sm font-mono">
                            {user?.email}
                        </div>
                        <button
                            onClick={async () => {
                                await signOut()
                                navigate('/auth')
                            }}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<Users className="text-brand-blue" />}
                        label="Waitlist Total"
                        value={waitlist.length}
                        color="bg-brand-gold"
                    />
                    <StatCard
                        icon={<MessageSquare className="text-brand-gold" />}
                        label="Feedback received"
                        value={waitlist.filter(w => w.feedback).length}
                        color="bg-brand-blue"
                    />
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <div>
                            <p className="font-bold">Access Error</p>
                            <p className="text-sm opacity-80">{error}</p>
                            {error.includes('policy') && (
                                <p className="text-xs mt-1 font-mono bg-black/20 p-1 rounded">Did you run the RLS policy SQL?</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">Waitlist Signups</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader className="animate-spin text-white/30" />
                        </div>
                    ) : waitlist.length === 0 ? (
                        <div className="p-12 text-center text-white/30">
                            No signups yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium w-1/2">Feedback</th>
                                        <th className="p-4 font-medium">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {waitlist.map((entry) => (
                                        <motion.tr
                                            key={entry.email}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4 font-mono text-sm text-brand-gold">{entry.email}</td>
                                            <td className="p-4 text-sm text-white/80">
                                                {entry.feedback ? (
                                                    <span className="italic">"{entry.feedback}"</span>
                                                ) : (
                                                    <span className="opacity-20">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-white/50 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                {icon}
            </div>
            <div>
                <p className="text-white/50 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}
