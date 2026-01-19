'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AccountPage() {
    const { user, signOut, loading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)

    // Address State
    const [view, setView] = useState('orders') // 'orders' | 'addresses' | 'add-address' | 'edit-address'
    const [addresses, setAddresses] = useState([])
    const [addressForm, setAddressForm] = useState({
        full_name: '',
        address_line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
    })

    // Return State
    const [returnModal, setReturnModal] = useState({ isOpen: false, orderId: null, item: null })
    const [returnReason, setReturnReason] = useState('')
    const [returnLoading, setReturnLoading] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (user) {
            // Fetch Profile
            const getProfile = async () => {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (data) setProfile(data)
            }

            // Fetch Orders
            const getOrders = async () => {
                const { data } = await supabase
                    .from('orders')
                    .select(`
                        id, 
                        total_amount, 
                        currency, 
                        status, 
                        created_at, 
                        order_items (
                            id, 
                            product_id, 
                            size, 
                            quantity, 
                            products (name, image_url, price_usd)
                        ),
                        returns (
                            product_id,
                            status
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (data) setOrders(data)
                setOrdersLoading(false)
            }

            // Fetch Addresses
            const getAddresses = async () => {
                const { data } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                if (data) setAddresses(data)
            }

            getProfile()
            getOrders()
            getAddresses()
        }
    }, [user, loading, router])

    const openReturnDisplay = (order, item) => {
        setReturnModal({ isOpen: true, orderId: order.id, item: item })
    }

    const submitReturn = async (e) => {
        e.preventDefault()
        setReturnLoading(true)

        try {
            const { error } = await supabase.from('returns').insert([{
                user_id: user.id,
                order_id: returnModal.orderId,
                product_id: returnModal.item.product_id,
                reason: returnReason,
                status: 'pending'
            }])

            if (error) throw error

            alert('Return request submitted successfully. You will be notified via email.')
            setReturnModal({ isOpen: false, orderId: null, item: null })
            setReturnReason('')
        } catch (error) {
            alert('Failed to submit return: ' + error.message)
        } finally {
            setReturnLoading(false)
        }
    }

    const handleAddAddress = async (e) => {
        e.preventDefault()
        try {
            if (addressForm.id) {
                // UPDATE
                const { error } = await supabase
                    .from('addresses')
                    .update({
                        full_name: addressForm.full_name,
                        address_line1: addressForm.address_line1,
                        city: addressForm.city,
                        state: addressForm.state,
                        postal_code: addressForm.postal_code,
                        country: addressForm.country,
                        phone: addressForm.phone
                    })
                    .eq('id', addressForm.id)
                    .eq('user_id', user.id)

                if (error) throw error

                setAddresses(addresses.map(a => a.id === addressForm.id ? { ...a, ...addressForm } : a))
            } else {
                // CREATE
                const { data, error } = await supabase.from('addresses').insert([{
                    user_id: user.id,
                    ...addressForm
                }]).select()

                if (error) throw error
                setAddresses([data[0], ...addresses])
            }

            setView('addresses')
            setAddressForm({ full_name: '', address_line1: '', city: '', state: '', postal_code: '', country: '', phone: '' })
        } catch (error) {
            alert('Error saving address: ' + error.message)
        }
    }

    const handleEditAddress = (addr) => {
        setAddressForm(addr)
        setView('edit-address')
    }

    const handleDeleteAddress = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return
        try {
            const { error } = await supabase.from('addresses').delete().eq('id', id)
            if (error) throw error
            setAddresses(addresses.filter(a => a.id !== id))
        } catch (error) {
            alert('Error deleting: ' + error.message)
        }
    }

    if (loading || !user) return <div className="min-h-screen bg-white"></div>

    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 relative">
            {/* Return Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReturnModal({ isOpen: false, orderId: null, item: null })} />
                    <div className="bg-white relative w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setReturnModal({ isOpen: false, orderId: null, item: null })} className="absolute top-4 right-4 text-neutral-400 hover:text-black">✕</button>

                        <h3 className="text-xl font-black uppercase tracking-widest mb-6">Request Return</h3>

                        <div className="flex gap-4 mb-6 p-4 bg-neutral-50">
                            <img src={returnModal.item?.products?.image_url} className="w-16 h-20 object-cover bg-neutral-200" alt="" />
                            <div>
                                <p className="font-bold text-sm uppercase">{returnModal.item?.products?.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">Order #{returnModal.orderId.slice(0, 8)}</p>
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

            <div className="max-w-[1800px] mx-auto">

                <header className="mb-12 border-b border-black/10 pb-8 flex justify-between items-end">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-neutral-400 mb-2 block">My Account</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">
                            Hi, {profile?.full_name?.split(' ')[0] || user.email.split('@')[0]}
                        </h1>
                    </div>
                    <button
                        onClick={signOut}
                        className="px-6 py-2 border border-black text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                        Log Out
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* PROFILE CARD */}
                    <div className="p-8 border border-black/10 bg-neutral-50 h-fit">
                        <div className="w-16 h-16 bg-black rounded-full mb-6 flex items-center justify-center text-white text-xl font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-1">Profile Info</h2>
                        <p className="text-sm text-neutral-500 font-mono mb-4">{user.email}</p>
                        {profile?.full_name && (
                            <p className="text-sm font-bold uppercase tracking-wide mb-6">{profile.full_name}</p>
                        )}

                        <div className="flex flex-col gap-2 border-t border-black/5 pt-4">
                            <button
                                onClick={() => setView('orders')}
                                className={`text-left text-xs font-bold uppercase tracking-widest py-3 hover:pl-2 transition-all ${view === 'orders' ? 'text-black pl-2 border-l-2 border-black' : 'text-neutral-500'}`}
                            >
                                Order History
                            </button>
                            <button
                                onClick={() => setView('addresses')}
                                className={`text-left text-xs font-bold uppercase tracking-widest py-3 hover:pl-2 transition-all ${view.includes('address') ? 'text-black pl-2 border-l-2 border-black' : 'text-neutral-500'}`}
                            >
                                Saved Addresses
                            </button>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-2">

                        {/* -------------------- VIEWS -------------------- */}

                        {view === 'orders' && (
                            <>
                                <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Recent Orders</h2>
                                {ordersLoading ? (
                                    <div className="p-12 text-center text-neutral-400 text-xs uppercase tracking-widest">Loading Orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="border border-black/10 p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                                        <span className="text-4xl">📦</span>
                                        <h3 className="font-bold uppercase tracking-wide">No orders yet</h3>
                                        <button onClick={() => router.push('/shop')} className="mt-4 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-8">
                                        {orders.map(order => (
                                            <div key={order.id} className="border border-black/10 p-6 group hover:border-black transition-colors bg-white">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-6 pb-6 border-b border-black/5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold uppercase tracking-widest text-sm">Order #{order.id.slice(0, 8)}</span>
                                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
                                                                }`}>{order.status}</span>
                                                        </div>
                                                        <span className="text-xs text-neutral-500 font-mono">
                                                            {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="font-mono font-bold block mb-1">
                                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(order.total_amount)}
                                                        </span>
                                                        <Link href={`/account/orders/${order.id}`} className="text-[10px] uppercase font-bold tracking-widest border-b border-black/20 hover:border-black transition-colors">
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="space-y-4">
                                                    {order.order_items?.map((item, idx) => {
                                                        const returnStatus = order.returns?.find(r => r.product_id === item.product_id)?.status
                                                        return (
                                                            <div key={idx} className="flex justify-between items-center sm:items-start gap-4">
                                                                <div className="flex gap-4">
                                                                    <div className="w-12 h-16 bg-neutral-100 flex-shrink-0 relative overflow-hidden">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={item.products?.image_url} alt="" className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold uppercase tracking-wide">{item.products?.name}</p>
                                                                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest">Size: {item.size || 'STD'}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Return Action */}
                                                                {returnStatus ? (
                                                                    <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${returnStatus === 'approved' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                        returnStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                            returnStatus === 'refunded' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                                'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                                        }`}>
                                                                        Return {returnStatus.replace('_', ' ')}
                                                                    </div>
                                                                ) : ['delivered'].includes(order.status) ? (
                                                                    <button
                                                                        onClick={() => openReturnDisplay(order, item)}
                                                                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black border-b border-transparent hover:border-black transition-all"
                                                                    >
                                                                        Return Item
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}



                        {view === 'addresses' && (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-sm font-bold uppercase tracking-widest">Saved Addresses</h2>
                                    <button
                                        onClick={() => {
                                            setAddressForm({ full_name: '', address_line1: '', city: '', state: '', postal_code: '', country: '', phone: '' })
                                            setView('add-address')
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-4 py-2 hover:opacity-80 transition-opacity"
                                    >
                                        + Add New
                                    </button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="border border-black/10 p-12 text-center">
                                        <p className="text-neutral-500 text-sm mb-4">You haven't saved any addresses yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="border border-black/10 p-6 relative group hover:border-black transition-colors">
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="text-neutral-400 hover:text-black"
                                                        title="Edit Address"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="text-neutral-400 hover:text-red-500"
                                                        title="Delete Address"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                                <h3 className="font-bold uppercase text-sm mb-2">{addr.full_name}</h3>
                                                <div className="text-sm text-neutral-600 space-y-1">
                                                    <p>{addr.address_line1}</p>
                                                    <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                                                    <p>{addr.country}</p>
                                                    <p className="text-xs pt-2 font-mono text-neutral-400">T: {addr.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}


                        {(view === 'add-address' || view === 'edit-address') && (
                            <div className="max-w-xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-sm font-bold uppercase tracking-widest">{view === 'edit-address' ? 'Edit Address' : 'Add New Address'}</h2>
                                    <button onClick={() => setView('addresses')} className="text-xs underline">Cancel</button>
                                </div>
                                <form onSubmit={handleAddAddress} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <input required placeholder="Full Name" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                    value={addressForm.full_name} onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <input required type="tel" placeholder="Mobile Number (Mandatory)" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                    value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                            </div>
                                        </div>

                                        <input required placeholder="Address Line 1" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                            value={addressForm.address_line1} onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} />

                                        <div className="grid grid-cols-2 gap-4">
                                            <input required placeholder="City" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                            <input required placeholder="State / Region" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required placeholder="Postal Code" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
                                            <input required placeholder="Country" className="w-full bg-neutral-50 border-b border-black/10 p-3 focus:border-black outline-none"
                                                value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:opacity-80 transition-opacity mt-4">
                                        {view === 'edit-address' ? 'Update Address' : 'Save Address'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )
}
