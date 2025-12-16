import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { user, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-brand-blue text-white font-sans flex flex-col">
            <nav className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-sm bg-brand-blue/80 sticky top-0 z-50">
                <Link to="/" className="text-2xl font-bold text-brand-gold tracking-tighter">
                    SFHT ASCENT
                </Link>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hover:text-brand-teal transition-colors">Dashboard</Link>
                            <Link to="/lessons" className="hover:text-brand-teal transition-colors">Wisdom</Link>
                            <Link to="/profile" className="hover:text-brand-teal transition-colors">Profile</Link>
                            <button
                                onClick={signOut}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/auth"
                            className="px-6 py-2 rounded-full bg-brand-gold text-brand-blue font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
                        >
                            Start Ascent
                        </Link>
                    )}
                </div>
            </nav>
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <Outlet />
            </main>
        </div>
    )
}
