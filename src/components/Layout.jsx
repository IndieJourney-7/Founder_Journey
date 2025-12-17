import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { user, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const closeMobileMenu = () => setMobileMenuOpen(false)

    return (
        <div className="min-h-screen bg-brand-blue text-white font-sans flex flex-col">
            <nav className="p-4 border-b border-white/10 backdrop-blur-sm bg-brand-blue/80 sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-xl sm:text-2xl font-bold text-brand-gold tracking-tighter">
                        SFHT ASCENT
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-4 items-center">
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

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-3">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block py-2 px-3 hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/lessons"
                                    className="block py-2 px-3 hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Wisdom
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block py-2 px-3 hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        signOut()
                                        closeMobileMenu()
                                    }}
                                    className="w-full text-left py-2 px-3 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="block text-center py-2 px-6 rounded-full bg-brand-gold text-brand-blue font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
                                onClick={closeMobileMenu}
                            >
                                Start Ascent
                            </Link>
                        )}
                    </div>
                )}
            </nav>
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <Outlet />
            </main>
        </div>
    )
}
