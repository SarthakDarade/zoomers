'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const RETURN_STATUSES = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Processing Refund', value: 'processing_refund' },
    { label: 'Refunded', value: 'refunded' },
    { label: 'Rejected', value: 'rejected' },
]

export default function AdminReturns() {
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [stats, setStats] = useState({ todayPending: 0, todayApproved: 0 })

    useEffect(() => {
        fetchReturns()
        fetchStats()
    }, [filter])

    const fetchStats = async () => {
        const today = new Date().toISOString().split('T')[0]

        const { count: pendingCount } = await supabase
            .from('returns')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
        // .gte('created_at', today) // Uncomment for strictly today

        const { count: approvedCount } = await supabase
            .from('returns')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .gte('created_at', today)

        setStats({
            todayPending: pendingCount || 0,
            todayApproved: approvedCount || 0
        })
    }

    const fetchReturns = async () => {
        setLoading(true)
        let query = supabase
            .from('returns')
            .select(`
                *,
                orders (id, user_email, created_at),
                products (name, image_url, price_usd)
            `)
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query
        if (data) setReturns(data)
        setLoading(false)
    }

    const updateStatus = async (id, newStatus) => {
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))

        if (selectedReturn?.id === id) {
            setSelectedReturn(prev => ({ ...prev, status: newStatus }))
        }

        await supabase
            .from('returns')
            .update({ status: newStatus })
            .eq('id', id)

        fetchStats()
    }

    const handleReview = (returnItem) => {
        setSelectedReturn(returnItem)
        setIsDrawerOpen(true)
    }

    return (
        <div className="space-y-8 pb-20 relative min-h-screen">
            {/* --- SECTION 1: HEADER --- */}
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Returns</h2>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                            {stats.todayPending} Pending Review
                        </span>
                        <span className="text-white/10 text-[10px]">|</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">
                            {stats.todayApproved} Approved Today
                        </span>
                    </div>
                </div>
            </header>

            {/* --- SECTION 2: STATUS FILTER BAR --- */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
                {RETURN_STATUSES.map(status => (
                    <button
                        key={status.value}
                        onClick={() => setFilter(status.value)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${filter === status.value
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                            }`}
                    >
                        {status.label}
                    </button>
                ))}
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${filter === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5'
                        }`}
                >
                    All
                </button>
            </div>

            {/* --- SECTION 3: RETURNS TABLE --- */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <th className="px-6 py-4">Return ID</th>
                            <th className="px-6 py-4">Order Ref</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && returns.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-12 text-center text-white/20 font-mono text-xs uppercase animate-pulse">Scanning Requests...</td></tr>
                        ) : returns.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-12 text-center text-white/20 font-mono text-xs uppercase">No {filter} returns found.</td></tr>
                        ) : (
                            returns.map(r => (
                                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] text-white/60">
                                        {r.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] text-white/40">
                                        {r.orders?.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-white/80">
                                        {r.orders?.user_email}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-white/60">
                                        {r.products?.name || 'Unknown Item'}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-white/60 truncate max-w-[150px]">
                                        {r.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusLabel status={r.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleReview(r)}
                                            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/40 px-3 py-1.5 rounded transition-all"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- SECTION 5: REVIEW DRAWER --- */}
            <ReviewDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                returnItem={selectedReturn}
                onUpdateStatus={updateStatus}
            />
        </div>
    )
}

function StatusLabel({ status }) {
    const colors = {
        pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        approved: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        processing_refund: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        refunded: 'text-green-500 bg-green-500/10 border-green-500/20',
        rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
    }

    return (
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm border ${colors[status] || 'text-white/40 bg-white/5 border-white/10'}`}>
            {status.replace('_', ' ')}
        </span>
    )
}

function ReviewDrawer({ isOpen, onClose, returnItem, onUpdateStatus }) {
    if (!isOpen) return null

    // Mock policy check
    const purchaseDate = new Date(returnItem.orders?.created_at)
    const today = new Date()
    const daysSincePurchase = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24))
    const isEligible = daysSincePurchase <= 30

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#0D0D0D] h-full shadow-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 ease-out">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Return Review</h3>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">ID: {returnItem.id}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">

                    {/* Decision Matrix */}
                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Decision Matrix</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {returnItem.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => onUpdateStatus(returnItem.id, 'approved')}
                                        className="px-4 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                    >
                                        Approve Return
                                    </button>
                                    <button
                                        onClick={() => onUpdateStatus(returnItem.id, 'rejected')}
                                        className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                                    >
                                        Reject Request
                                    </button>
                                </>
                            )}
                            {returnItem.status === 'approved' && (
                                <button
                                    onClick={() => onUpdateStatus(returnItem.id, 'processing_refund')}
                                    className="col-span-2 px-4 py-3 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                                >
                                    Initiate Refund Process
                                </button>
                            )}
                            {returnItem.status === 'processing_refund' && (
                                <button
                                    onClick={() => onUpdateStatus(returnItem.id, 'refunded')}
                                    className="col-span-2 px-4 py-3 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-colors"
                                >
                                    Confirm Refund Complete
                                </button>
                            )}
                            {['refunded', 'rejected'].includes(returnItem.status) && (
                                <div className="col-span-2 p-4 border border-dashed border-white/10 text-center">
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Case Closed: {returnItem.status}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Eligibility Check */}
                    <section className="p-4 bg-white/5 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Policy Check</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isEligible ? 'text-green-500' : 'text-red-500'}`}>
                                {isEligible ? 'Eligible' : 'Out of Policy'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono text-white/60">
                            <span>Window: 30 Days</span>
                            <span>Actual: {daysSincePurchase} Days</span>
                        </div>
                    </section>

                    {/* Item Details */}
                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Item Context</h4>
                        <div className="flex gap-4 p-4 bg-white/5 rounded border border-white/5">
                            <div className="w-16 h-20 bg-white/10 rounded overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={returnItem.products?.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-white">{returnItem.products?.name}</div>
                                <div className="text-xs text-white/40 mt-1">Reason: <span className="text-white italic">"{returnItem.reason}"</span></div>
                            </div>
                        </div>
                    </section>

                    {/* Financials */}
                    <section className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Refund Value</span>
                            <span className="font-mono text-xs text-white">${returnItem.products?.price_usd}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Deductions</span>
                            <span className="font-mono text-xs text-whiteish">-$0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Total Refund</span>
                            <span className="text-xl font-black text-white">${returnItem.products?.price_usd}</span>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}
