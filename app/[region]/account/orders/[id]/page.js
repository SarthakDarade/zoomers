'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useCurrency } from '@/context/CurrencyContext'

export default function OrderDetailsPage() {
    const { id } = useParams()
    const { user, loading } = useAuth()
    const router = useRouter()

    const [order, setOrder] = useState(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    // Return State
    const [returnModal, setReturnModal] = useState({ isOpen: false, item: null })
    const [returnReason, setReturnReason] = useState('')
    const [returnLoading, setReturnLoading] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        if (user && id) {
            fetchOrder()
        }
    }, [user, loading, id])

    const fetchOrder = async () => {
        try {
            // Join order_items and nested products to get full details (images, names)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        *,
                        product:products (*)
                    ),
                    returns (
                        product_id,
                        status
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error

            // Security check: Ensure order belongs to user
            if (data.user_id !== user.id) {
                router.push('/account')
                return
            }

            setOrder(data)
        } catch (error) {
            console.error('Error fetching order:', error)
            // router.push('/account') 
        } finally {
            setPageLoading(false)
        }
    }

    const handleCancelClick = () => {
        setShowCancelModal(true)
    }

    const confirmCancellation = async () => {
        setCancelling(true)
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', id)

            if (error) throw error

            setShowCancelModal(false)
            fetchOrder()
        } catch (error) {
            console.error(error)
            alert('Cancellation failed: ' + error.message)
        } finally {
            setCancelling(false)
        }
    }

    const openReturnDisplay = (item) => {
        setReturnModal({ isOpen: true, item: item })
    }

    const submitReturn = async (e) => {
        e.preventDefault()
        setReturnLoading(true)

        try {
            const { error } = await supabase.from('returns').insert([{
                user_id: user.id,
                order_id: id,
                product_id: returnModal.item.product_id,
                reason: returnReason,
                status: 'pending'
            }])

            if (error) throw error

            alert('Return request submitted successfully.')
            setReturnModal({ isOpen: false, item: null })
            setReturnReason('')
            fetchOrder() // Refresh to show new status
        } catch (error) {
            alert('Failed to submit return: ' + error.message)
        } finally {
            setReturnLoading(false)
        }
    }

    if (pageLoading) return <div className="min-h-screen bg-white pt-32 flex justify-center"><div className="animate-pulse">Loading Protocol...</div></div>

    if (!order) return <div className="min-h-screen bg-white pt-32 text-center">Order not found.</div>

    // Process items to flatten structure:
    const items = (order.items || []).map(item => ({
        ...item,
        name: item.product?.name || 'Unknown Artifact',
        image_url: item.product?.image_url || '',
        price_at_purchase: item.price // Use the price stored in order_items
    }))

    const shipping = order.shipping_address || {}
    const currentStatus = order.status?.toLowerCase() || 'pending'
    const isCancellable = ['pending', 'processing', 'paid'].includes(currentStatus)

    // Status Logic - Treat 'paid' as 'Order Created' (step 1 complete)
    const isPaid = ['paid', 'processing', 'shipped', 'delivered'].includes(currentStatus)
    const isShipped = ['shipped', 'delivered'].includes(currentStatus)
    const isDelivered = ['delivered'].includes(currentStatus)

    // Helper for formatting price in Order's original currency
    const formatOrderPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency || 'USD'
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24 relative">
            {/* Return Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReturnModal({ isOpen: false, item: null })} />
                    <div className="bg-white relative w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setReturnModal({ isOpen: false, item: null })} className="absolute top-4 right-4 text-neutral-400 hover:text-black">✕</button>

                        <h3 className="text-xl font-black uppercase tracking-widest mb-6">Request Return</h3>

                        <div className="flex gap-4 mb-6 p-4 bg-neutral-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={returnModal.item?.image_url} className="w-16 h-20 object-cover bg-neutral-200" alt="" />
                            <div>
                                <p className="font-bold text-sm uppercase">{returnModal.item?.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">Order #{id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <form onSubmit={submitReturn} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Reason for Return</label>
                                <select
                                    required
                                    className="w-full p-3 border border-black/10 focus:border-black outline-none bg-white text-sm"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Size too small">Size too small</option>
                                    <option value="Size too big">Size too big</option>
                                    <option value="Item defective">Item defective</option>
                                    <option value="Changed mind">Changed mind</option>
                                    <option value="Incorrect item">Incorrect item</option>
                                </select>
                            </div>

                            <p className="text-[10px] text-neutral-500 leading-relaxed">
                                Note: Returns are subject to approval. Once approved, you will receive a shipping label via email. Refunds are processed within 5-7 days of receipt.
                            </p>

                            <button
                                type="submit"
                                disabled={returnLoading}
                                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {returnLoading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-[1200px] mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-black/10 pb-8 gap-6">
                    <div>
                        <Link href="/account" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-4 block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                            Order #{order.id.slice(0, 8)}
                        </h1>
                        <p className="font-mono text-sm text-neutral-500">
                            Placed on {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm border ${order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-600' :
                            order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-600' :
                                'bg-neutral-100 border-neutral-200 text-black'
                            }`}>
                            Status: {order.status?.toUpperCase()}
                        </span>
                        {isCancellable && (
                            <button
                                onClick={handleCancelClick}
                                disabled={cancelling}
                                className="group flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelling ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Cancel Order</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COL: ITEMS */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2">Artifacts</h2>
                            <div className="space-y-4">
                                {items.length === 0 ? (
                                    <div className="text-neutral-500 italic">No artifacts recorded.</div>
                                ) : (
                                    items.map((item, idx) => {
                                        const returnStatus = order.returns?.find(r => r.product_id === item.product_id)?.status
                                        return (
                                            <div key={idx} className="flex gap-6 p-4 border border-black/5 hover:border-black/20 transition-colors bg-neutral-50/50">
                                                <div className="relative w-20 aspect-[4/5] bg-neutral-200 shrink-0">
                                                    {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold uppercase text-sm tracking-tight">{item.name}</h3>
                                                            <p className="text-[10px] text-neutral-500 uppercase tracking-wide mt-1">Size: {item.size}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-mono font-bold block">
                                                                {formatOrderPrice(item.price_at_purchase || item.price)}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-400">Qty {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    {/* Return Logic */}
                                                    <div className="mt-4 flex justify-end">
                                                        {returnStatus ? (
                                                            <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${returnStatus === 'approved' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                returnStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                    returnStatus === 'refunded' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                        'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                                }`}>
                                                                Return {returnStatus.replace('_', ' ')}
                                                            </div>
                                                        ) : ['delivered'].includes(order.status) && (
                                                            <button
                                                                onClick={() => openReturnDisplay(item)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black border-b border-transparent hover:border-black transition-all"
                                                            >
                                                                Request Return
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black/10 pb-2">Tracking Protocol</h2>
                            <div className="bg-neutral-50 p-6 border border-black/5">
                                {currentStatus === 'cancelled' ? (
                                    <div className="text-red-500 font-mono text-sm">Order Cancelled. Refund initiated if applicable.</div>
                                ) : (
                                    <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">

                                        {/* STEP 1: Created */}
                                        <div className={`relative pl-8 transition-opacity duration-500 ${isPaid ? 'opacity-100' : 'opacity-40'}`}>
                                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full z-10 transition-colors duration-500 ${isPaid ? 'bg-black' : 'bg-neutral-300'}`}></div>
                                            <h4 className="text-xs font-bold uppercase tracking-wide">Order Created</h4>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-1">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* STEP 2: Dispatched */}
                                        <div className={`relative pl-8 transition-opacity duration-500 ${isShipped ? 'opacity-100' : 'opacity-40'}`}>
                                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full z-10 transition-colors duration-500 ${isShipped ? 'bg-black' : 'bg-neutral-300'}`}></div>
                                            <h4 className="text-xs font-bold uppercase tracking-wide">Dispatched via DHL</h4>
                                            {isShipped ? (
                                                <p className="text-[10px] text-neutral-500 font-mono mt-1">In Transit</p>
                                            ) : (
                                                <p className="text-[10px] text-neutral-500 font-mono mt-1">Pending dispatch...</p>
                                            )}
                                        </div>

                                        {/* STEP 3: Delivered */}
                                        <div className={`relative pl-8 transition-opacity duration-500 ${isDelivered ? 'opacity-100' : 'opacity-40'}`}>
                                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full z-10 transition-colors duration-500 ${isDelivered ? 'bg-black' : 'bg-neutral-300'}`}></div>
                                            <h4 className="text-xs font-bold uppercase tracking-wide">Delivered</h4>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COL: INFO */}
                    <div className="space-y-8">
                        <div className="bg-neutral-50 p-8 border border-black/10">
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-neutral-400">Shipping Data</h2>
                            <div className="font-mono text-sm space-y-1">
                                {/* Extended fallbacks for address fields */}
                                <p className="font-bold">
                                    {shipping.first_name || shipping.firstName || (shipping.full_name ? shipping.full_name.split(' ')[0] : 'Unknown')} {shipping.last_name || shipping.lastName || ''}
                                </p>
                                <p>{shipping.line1 || shipping.address || shipping.address_line1 || 'No Address Line'}</p>
                                <p>{shipping.city || 'No City'}, {shipping.postal_code || shipping.postalCode || shipping.zip || ''}</p>
                                <p>{shipping.country || 'India'}</p>
                            </div>
                        </div>

                        <div className="bg-black text-white p-8">
                            <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/50">Payment Summary</h2>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Subtotal</span>
                                    <span>{formatOrderPrice(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Shipping</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatOrderPrice(order.total_amount)}</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                                Method: {order.payment_gateway?.toUpperCase().replace('_', ' ') || order.payment_method || 'PREPAID'}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* CONFIRMATION OVERLAY */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white border border-black/10 w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Abort Order Protocol?</h3>
                            <p className="text-sm text-neutral-500 mt-2">
                                Are you sure you want to cancel Order #{order.id.slice(0, 8)}?<br />
                                This action cannot be reversed.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-black/10 hover:border-black transition-colors"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={cancelling}
                                className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Aborting...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
