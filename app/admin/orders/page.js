'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_OPTIONS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Returned', value: 'returned' },
    { label: 'Failed', value: 'failed' },
    { label: 'All', value: 'all' },
]

export default function AdminOrders() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [stats, setStats] = useState({ today: 0 })

    // Pagination (simplified for this iteration)
    const [page, setPage] = useState(0)
    const pageSize = 20

    useEffect(() => {
        fetchOrders()
        fetchStats()
    }, [filter, page])

    // Handle deep linked order
    useEffect(() => {
        const orderId = searchParams.get('highlight')
        if (orderId) {
            fetchSingleOrder(orderId)
        }
    }, [searchParams])

    const fetchStats = async () => {
        const today = new Date().toISOString().split('T')[0]
        const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today)

        if (count !== null) setStats({ today: count })
    }

    const fetchOrders = async () => {
        setLoading(true)
        let query = supabase
            .from('orders')
            .select(`
                id,
                created_at,
                user_email,
                total_amount,
                currency,
                status,
                order_items (id)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1)

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query
        if (data) setOrders(data)
        setLoading(false)
    }

    const fetchSingleOrder = async (id) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name, image_url)
                )
            `)
            .eq('id', id)
            .single()

        if (data) {
            setSelectedOrder(data)
            setIsDrawerOpen(true)
        }
    }

    const updateStatus = async (id, newStatus) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
        if (selectedOrder?.id === id) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus }))
        }

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            alert("Failed to update status")
            fetchOrders()
        }
    }

    const handleView = (order) => {
        fetchSingleOrder(order.id)
    }

    return (
        <div className="space-y-8 pb-20 relative min-h-screen">

            {/* --- SECTION 1: HEADER --- */}
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Orders</h2>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">
                            {stats.today} Inbound Today
                        </span>
                        <span className="text-white/10 text-[10px]">|</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Showing: {STATUS_OPTIONS.find(s => s.value === filter)?.label}
                        </span>
                    </div>
                </div>
            </header>

            {/* --- SECTION 2: STATUS FILTER BAR --- */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
                {STATUS_OPTIONS.map(status => (
                    <button
                        key={status.value}
                        onClick={() => { setFilter(status.value); setPage(0); }}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${filter === status.value
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                            }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {/* --- SECTION 3: ORDERS TABLE --- */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <th className="px-6 py-4">Ref ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && orders.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-12 text-center text-white/20 font-mono text-xs uppercase animate-pulse">Scanning Archive...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-12 text-center text-white/20 font-mono text-xs uppercase">No {filter} orders found.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] text-white/60">
                                        {order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-white/40">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-white/80">
                                        {order.user_email}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-white/40">
                                        {order.order_items?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-white">
                                        {order.currency === 'INR' ? '₹' : order.currency === 'GBP' ? '£' : order.currency === 'EUR' ? '€' : '$'}
                                        {order.total_amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusLabel status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleView(order)}
                                            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/40 px-3 py-1.5 rounded transition-all"
                                        >
                                            View Data
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- SECTION 5: ORDER DETAIL DRAWER --- */}
            <OrderDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                order={selectedOrder}
                onUpdateStatus={updateStatus}
            />

        </div>
    )
}

function StatusLabel({ status }) {
    const colors = {
        pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        paid: 'text-green-500 bg-green-500/10 border-green-500/20',
        processing: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        shipped: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
        returned: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        failed: 'text-red-500 bg-red-500/10 border-red-500/20',
    }

    return (
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm border ${colors[status] || 'text-white/40 bg-white/5 border-white/10'}`}>
            {status}
        </span>
    )
}

function OrderDrawer({ isOpen, onClose, order, onUpdateStatus }) {
    const [invoice, setInvoice] = useState(null)

    useEffect(() => {
        if (isOpen && order) {
            fetchInvoice()
        } else {
            setInvoice(null)
        }
    }, [isOpen, order])

    const fetchInvoice = async () => {
        const { data } = await supabase.from('invoices').select('pdf_url').eq('order_id', order.id).single()
        if (data) setInvoice(data)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-[#0D0D0D] h-full shadow-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 ease-out">

                {/* Drawer Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Order Analysis</h3>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">REF: {order?.id}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all text-xl">✕</button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">

                    {/* Status Console */}
                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Command Control</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['processing', 'shipped', 'delivered', 'returned'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => onUpdateStatus(order.id, s)}
                                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${order.status === s
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    Mark as {s}
                                </button>
                            ))}
                            <button
                                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all col-span-2 ${order.status === 'cancelled'
                                    ? 'bg-red-500 text-black border-red-500'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                Mark as Cancelled
                            </button>
                        </div>
                    </section>

                    {/* Customer & Shipping */}
                    <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-8">
                        <section>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Integrant</h4>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">{order?.user_email}</p>
                                <p className="text-xs text-white/40 font-mono">UID: {order?.user_id?.slice(0, 12)}...</p>
                            </div>
                        </section>
                        <section>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Destination</h4>
                            <div className="text-xs text-white/60 leading-relaxed max-w-[200px] font-mono">
                                {order?.shipping_address ? (
                                    <>
                                        {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                                        {order.shipping_address.line1}<br />
                                        {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
                                        {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                                        {order.shipping_address.country}
                                    </>
                                ) : 'Standard Digital Delivery'}
                            </div>
                        </section>
                    </div>

                    {/* Manifest (Items) */}
                    <section className="border-t border-white/5 pt-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Shipment Manifest</h4>
                        <div className="space-y-4">
                            {order?.order_items?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/5 group">
                                    <div className="w-12 h-16 bg-white/10 rounded overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.products?.image_url} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-wide text-white">{item.products?.name}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Size: {item.size || 'STD'} | QTY: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-white">${item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Financial Summary */}
                    <section className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Subtotal</span>
                            <span className="font-mono text-xs text-white">${order?.total_amount}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Logistics</span>
                            <span className="font-mono text-xs text-green-500">FREE</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Full Value</span>
                            <span className="text-xl font-black text-white">${order?.total_amount}</span>
                        </div>
                    </section>
                </div>

                {/* Drawer Footer */}
                <div className="p-8 border-t border-white/5 bg-black flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${order?.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">System Ready for Fulfillment</p>
                    </div>

                    {invoice && (
                        <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-widest text-black bg-white px-4 py-2 hover:bg-neutral-200 transition-colors"
                        >
                            Download Invoice PDF
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
