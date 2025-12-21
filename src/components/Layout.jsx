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
                        SHIFT ASCENT
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

            {/* Footer with Creator Bio */}
            <footer className="bg-gradient-to-b from-brand-blue to-[#0a1529] border-t border-white/10 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Left: Creator Info */}
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-brand-gold mb-2">Built by Vamshi</h3>
                            <p className="text-white/80 text-sm max-w-md leading-relaxed">
                                On a mission of freedom. Life explorer building projects that matter.
                                <span className="block mt-1 text-brand-teal font-medium">
                                    Creating tools for ambitious founders who dare to climb.
                                </span>
                            </p>
                        </div>

                        {/* Right: Social Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://x.com/12e6V"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 rounded-full transition-all border border-white/10 hover:border-brand-gold/50 group"
                                aria-label="Follow Vamshi on X (Twitter)"
                            >
                                <svg
                                    className="w-5 h-5 text-white group-hover:text-brand-gold transition-colors"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="text-sm font-semibold text-white group-hover:text-brand-gold transition-colors">
                                    Follow @12e6V
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Bottom: Copyright */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-white/40 text-xs">
                            © {new Date().getFullYear()} SHIFT ASCENT. Empowering founders to reach new heights.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
