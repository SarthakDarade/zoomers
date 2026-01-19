'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else {
                checkAdmin()
            }
        }
    }, [user, loading])

    const checkAdmin = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error || data?.role !== 'admin') {
            router.push('/') // Redirect unauthorized
        } else {
            setIsAdmin(true)
        }
        setChecking(false)
    }

    if (loading || checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono uppercase tracking-widest text-xs">
                Verifying Credentials...
            </div>
        )
    }

    if (!isAdmin) return null

    const navItems = [
        { name: 'Overview', path: '/admin' },
        { name: 'Products', path: '/admin/products' },
        { name: 'Orders', path: '/admin/orders' },
        { name: 'Customers', path: '/admin/customers' },
        { name: 'Returns', path: '/admin/returns' },
        { name: 'System Control', path: '/admin/settings' },
    ]

    return (
        <div className="flex min-h-screen bg-[#111] text-white font-sans selection:bg-white selection:text-black">
            {/* SIDEBAR */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-screen z-50 bg-[#111]">
                <div className="p-8 border-b border-white/10">
                    <h1 className="text-xl font-black uppercase tracking-tighter">Zoomers<span className="text-white/40">OS</span></h1>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-2 font-mono">
                        Command Center v1.0
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`block px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${pathname === item.path
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate w-32">{user.email}</p>
                            <p className="text-[9px] text-green-500 uppercase tracking-widest mt-0.5">Admin Secured</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8 md:p-12">
                <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
