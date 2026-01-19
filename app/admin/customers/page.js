'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminCustomersPage() {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [stats, setStats] = useState({
        totalCustomers: 0,
        newCustomers: 0
    })

    // Pagination
    const [page, setPage] = useState(1)
    const ROWS_PER_PAGE = 20
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        fetchCustomers()
    }, [page])

    const fetchCustomers = async () => {
        try {
            setPageLoading(true)

            // 1. Fetch total count for pagination
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            setTotalCount(count || 0)

            // 2. Fetch Profiles with Orders & Returns
            // Note: In a larger system, we'd use a dedicated SQL view or RPC for performance.
            // Here we fetch relations and aggregate on client for the current page.
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    orders (
                        id,
                        created_at,
                        total_amount,
                        status,
                        currency,
                        shipping_address
                    ),
                    returns (
                        id,
                        status,
                        created_at
                    )
                `)
                .range((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE - 1)
                .order('created_at', { ascending: false })

            if (error) throw error

            // 3. Process Data for the View
            const processed = data?.map(profile => {
                const orders = profile.orders || []
                const returns = profile.returns || []

                // Sort orders by date descending
                orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

                const totalSpend = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? (o.total_amount || 0) : 0), 0)
                const lastOrderDate = orders.length > 0 ? orders[0].created_at : null

                // Status Logic
                // Active: Ordered in last 6 months
                // At Risk: No order in 6 months BUT has ordered before
                // New: Joined in last 30 days
                // Inactive: No orders ever
                const daysSinceLastOrder = lastOrderDate ? (new Date() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24) : null
                const joinedDaysAgo = (new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24)

                let status = 'Inactive'
                if (orders.length > 0) {
                    if (daysSinceLastOrder < 180) status = 'Active'
                    else status = 'At Risk'
                } else if (joinedDaysAgo < 30) {
                    status = 'New'
                }

                // Signals
                const signals = []
                if (totalSpend > 500) signals.push('high_value') // Arbitrary threshold
                if (othersReturnRate(orders.length, returns.length) > 20) signals.push('high_returns')
                if (status === 'At Risk') signals.push('inactive_recently')

                return {
                    ...profile,
                    stats: {
                        ordersCount: orders.length,
                        totalSpend,
                        lastOrderDate,
                        status,
                        signals
                    }
                }
            })

            // Calculate Header Stats (Approximate based on loaded data or separate rough query if needed)
            // For specifically requested "Total" and "New (7 days)", we might need a separate lightweight query if pagination hides them.
            // Let's do a quick separate fetch for the header stats to be accurate
            calculateHeaderStats()

            setCustomers(processed)

        } catch (e) {
            console.error('Error loading customers:', e)
        } finally {
            setPageLoading(false)
        }
    }

    const calculateHeaderStats = async () => {
        // Total is already in `count` from pagination
        // Fetch new customers in last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: newCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString())

        setStats(prev => ({
            totalCustomers: totalCount, // Use the pagination count which might be updated in next render, currently using stale state or we can just update it when we setTotalCount. 
            // Actually request said "Total Customers", we can just use the count we got.
            newCustomers: newCount || 0
        }))
    }

    const othersReturnRate = (orders, returns) => {
        if (!orders) return 0
        return (returns / orders) * 100
    }

    // Handlers
    const openDrawer = (customer) => setSelectedCustomer(customer)
    const closeDrawer = () => setSelectedCustomer(null)

    if (pageLoading && customers.length === 0) {
        return <div className="min-h-screen bg-neutral-900 text-white p-12 font-mono uppercase tracking-widest text-xs">Loading Directory...</div>
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-white selection:text-black pb-24">

            {/* SECTION 1 — PAGE HEADER */}
            <header className="px-8 py-12 border-b border-white/10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Customers</h1>
                    <div className="flex gap-8 text-xs font-mono text-neutral-400 uppercase tracking-widest">
                        <span>Directory Analysis</span>
                        <span>v1.0.0</span>
                    </div>
                </div>
                <div className="flex gap-12 text-right">
                    <div>
                        <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Total Profiles</span>
                        <span className="text-2xl font-mono">{totalCount}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">New (7d)</span>
                        <span className="text-2xl font-mono text-green-400">+{stats.newCustomers}</span>
                    </div>
                </div>
            </header>

            <main className="px-8 py-12">

                {/* SECTION 2 — CUSTOMERS TABLE */}
                <div className="border border-white/10 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                                <th className="px-6 py-4 w-1/4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Orders</th>
                                <th className="px-6 py-4 text-right">Total Spend</th>
                                <th className="px-6 py-4 text-right">Last Order</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => openDrawer(c)}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{c.full_name || 'Anonymous User'}</div>
                                        <div className="text-xs text-neutral-500 font-mono mt-1">{c.email}</div>
                                        {/* Signals in list view? Maybe subtle dots */}
                                        <div className="flex gap-1 mt-2">
                                            {c.stats.signals.includes('high_value') && <div className="w-1 h-1 bg-yellow-400 rounded-full" title="High Value"></div>}
                                            {c.stats.signals.includes('high_returns') && <div className="w-1 h-1 bg-red-400 rounded-full" title="High Returns"></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${c.stats.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            c.stats.status === 'At Risk' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                c.stats.status === 'New' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                                            }`}>
                                            {c.stats.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-neutral-400 group-hover:text-white transition-colors">
                                        {c.stats.ordersCount}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.stats.totalSpend)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-xs text-neutral-500">
                                        {c.stats.lastOrderDate ? new Date(c.stats.lastOrderDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white border-b border-transparent hover:border-white transition-all">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-8 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                    >
                        ← Prev
                    </button>
                    <span>Page {page} of {Math.ceil(totalCount / ROWS_PER_PAGE)}</span>
                    <button
                        disabled={page * ROWS_PER_PAGE >= totalCount}
                        onClick={() => setPage(p => p + 1)}
                        className="hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            </main>

            {/* SECTION 3 — CUSTOMER DETAIL DRAWER */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={closeDrawer}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg bg-neutral-900 border-l border-white/10 h-full shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">

                        <div className="p-8 border-b border-white/10 flex justify-between items-start bg-neutral-900 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{selectedCustomer.full_name || 'Anonymous Profile'}</h2>
                                <p className="font-mono text-xs text-neutral-500 mt-2">{selectedCustomer.email}</p>
                                <div className="flex gap-2 mt-4">
                                    {selectedCustomer.stats.signals.map(s => (
                                        <span key={s} className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest rounded-sm text-white/70">
                                            {s.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={closeDrawer} className="text-neutral-500 hover:text-white transition-colors">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-12">

                            {/* Signal Briefing */}
                            {selectedCustomer.stats.signals.length > 0 && (
                                <section className="p-6 bg-white/5 border border-white/5">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Context Signals</h3>
                                    <ul className="space-y-2 text-sm text-neutral-300">
                                        {selectedCustomer.stats.signals.includes('high_value') && (
                                            <li className="flex gap-3 items-center">
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                                <span>Significant lifetime value (&gt; $500). VIP potential.</span>
                                            </li>
                                        )}
                                        {selectedCustomer.stats.signals.includes('high_returns') && (
                                            <li className="flex gap-3 items-center">
                                                <div className="w-2 h-2 bg-red-400 rounded-full" />
                                                <span>Return rate above 20%. Verify size guide usage.</span>
                                            </li>
                                        )}
                                        {selectedCustomer.stats.signals.includes('inactive_recently') && (
                                            <li className="flex gap-3 items-center">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                                <span>No activity in 6+ months. At risk of churn.</span>
                                            </li>
                                        )}
                                    </ul>
                                </section>
                            )}

                            {/* Metrics */}
                            <section className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-white/10 bg-white/[0.02]">
                                    <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Lifetime Spend</span>
                                    <span className="text-xl font-mono font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedCustomer.stats.totalSpend)}
                                    </span>
                                </div>
                                <div className="p-4 border border-white/10 bg-white/[0.02]">
                                    <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Orders</span>
                                    <span className="text-xl font-mono font-bold">
                                        {selectedCustomer.stats.ordersCount}
                                    </span>
                                </div>
                            </section>

                            {/* Order History */}
                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-white/10 pb-2">Order History</h3>
                                <div className="space-y-1">
                                    {selectedCustomer.orders?.length === 0 ? (
                                        <div className="text-neutral-500 italic text-sm">No orders found.</div>
                                    ) : (
                                        selectedCustomer.orders.map(order => (
                                            <div key={order.id} className="grid grid-cols-12 gap-4 py-3 border-b border-white/5 text-sm hover:bg-white/5 px-2 -mx-2 transition-colors">
                                                <div className="col-span-3 font-mono text-neutral-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="col-span-3 font-bold">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(order.total_amount)}
                                                </div>
                                                <div className="col-span-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'text-green-500' :
                                                        order.status === 'cancelled' ? 'text-red-500' : 'text-neutral-400'
                                                        }`}>{order.status}</span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <button onClick={() => router.push(`/admin/orders`)} className="text-[10px] uppercase tracking-widest border-b border-white/20 hover:border-white">
                                                        REF
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Returns History */}
                            {selectedCustomer.returns?.length > 0 && (
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-white/10 pb-2">Returns History</h3>
                                    <div className="space-y-1">
                                        {selectedCustomer.returns.map(ret => (
                                            <div key={ret.id} className="grid grid-cols-12 gap-4 py-3 border-b border-white/5 text-sm hover:bg-white/5 px-2 -mx-2 transition-colors">
                                                <div className="col-span-4 font-mono text-neutral-500">
                                                    {new Date(ret.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="col-span-6">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${ret.status === 'approved' ? 'text-green-500' :
                                                            ret.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                                                        }`}>{ret.status.replace('_', ' ')}</span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <button onClick={() => router.push(`/admin/returns`)} className="text-[10px] uppercase tracking-widest border-b border-white/20 hover:border-white">
                                                        VIEW
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Notes (Hardcoded for now as 'Internal Only') */}
                            <section>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-white/10 pb-2">Internal Protocol</h3>
                                <div className="bg-neutral-800/50 p-4 border border-white/5 text-sm text-neutral-400 font-mono">
                                    NO ACTIVE NOTES. <br />
                                    SYSTEM GENERATED.
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
