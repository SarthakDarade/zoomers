'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'

const CurrencySelector = () => {
    const { currency, setCurrency, allCurrencies } = useCurrency()
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs font-bold font-mono text-black hover:opacity-70 transition-opacity flex items-center gap-1"
            >
                {currency}
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 py-1 bg-white border border-neutral-100 rounded-lg shadow-xl w-32 flex flex-col z-[60]">
                    {Object.values(allCurrencies).map((c) => (
                        <button
                            key={c.code}
                            onClick={() => {
                                setCurrency(c.code)
                                setIsOpen(false)
                            }}
                            className={`px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors ${currency === c.code ? 'text-black bg-neutral-50' : 'text-neutral-500'}`}
                        >
                            {c.code} {c.symbol}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const { cart, setIsCartOpen } = useCart()
    const { user } = useAuth()
    const { region } = useCurrency()
    const router = useRouter()

    // Search State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearchOpen])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/${region}/shop?search=${encodeURIComponent(searchQuery.trim())}`)
            setIsSearchOpen(false)
            setSearchQuery('')
        }
    }

    return (
        <>
            {/* ANNOUNCEMENT BAR */}
            <div className="w-full bg-black text-white py-2 text-[10px] font-bold uppercase tracking-widest text-center z-[49] relative">
                Global Express Shipping — Free on orders over $500
            </div>

            <nav className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 bg-white border-b border-neutral-100`}>
                <div className="max-w-[1800px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center relative bg-white z-50">

                    {/* LEFT: NAV (Desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href={`/${region}/new-arrivals`} className="text-xs font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors">New Arrivals</Link>
                        <Link href={`/${region}/shop`} className="text-xs font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors">Shop</Link>
                        <Link href={`/${region}/collections`} className="text-xs font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors">Collections</Link>
                    </div>

                    {/* CENTER: LOGO */}
                    <Link href={`/${region}`} className="text-2xl font-black tracking-tighter text-black uppercase absolute left-1/2 -translate-x-1/2">
                        Zoomers
                    </Link>

                    {/* RIGHT: UTILITIES */}
                    <div className="flex items-center gap-6 z-50 bg-white">
                        <CurrencySelector />

                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="text-black hover:opacity-70 transition-opacity"
                        >
                            <span className="sr-only">Search</span>
                            {isSearchOpen ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            )}
                        </button>

                        <Link href={`/${region}/account`} className="text-black hover:opacity-70 transition-opacity relative">
                            <span className="sr-only">Account</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {user && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="text-black hover:opacity-70 transition-opacity relative"
                        >
                            <span className="sr-only">Cart</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* HAMBURGER BUTTON (Mobile Only) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden text-black z-50 ml-2"
                        >
                            {isMobileMenuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU OVERLAY */}
                <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-32 px-6 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <nav className="flex flex-col gap-6">
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/new-arrivals`} className="text-3xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors">New Arrivals</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/shop`} className="text-3xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors">Shop</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/collections`} className="text-3xl font-black uppercase tracking-tighter hover:text-neutral-500 transition-colors">Collections</Link>

                        <div className="h-px w-full bg-neutral-100 my-4"></div>

                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/account`} className="text-xl font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">My Account</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/about`} className="text-xl font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">About</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${region}/refund-policy`} className="text-xl font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">Refund Policy</Link>
                    </nav>
                    <div className="mt-auto pb-12">
                        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">Zoomers Archive System™</p>
                    </div>
                </div>

                {/* SEARCH PANEL */}
                <div className={`absolute top-full left-0 w-full bg-white border-b border-black/10 transition-all duration-300 overflow-hidden ${isSearchOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-8">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="SEARCH ARCHIVE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-2xl font-black tracking-tighter uppercase placeholder:text-neutral-300 outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-black hover:opacity-60"
                            >
                                Enter
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    )
}
