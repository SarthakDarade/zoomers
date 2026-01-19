'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'

export default function CheckoutForm() {
    const { cart, cartTotal, removeFromCart, clearCart } = useCart()
    const { currency, formatPrice, getProductPrice, region } = useCurrency()
    const { user } = useAuth()
    const router = useRouter()

    // State
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        phone: ''
    })

    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [savedAddresses, setSavedAddresses] = useState([])
    const [shouldSaveAddress, setShouldSaveAddress] = useState(false)

    // Auto-select gateway: Razorpay for INR, Stripe for everything else
    const paymentHub = currency === 'INR' ? 'razorpay' : 'stripe'

    const paymentOptions = [
        {
            id: 'stripe',
            name: 'Stripe Global Hub',
            description: 'International Cards / Apple Pay / Google Pay',
            icon: (
                <div className="flex gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-3 w-auto opacity-70 grayscale contrast-125" />
                </div>
            )
        },
        {
            id: 'razorpay',
            name: 'Razorpay India Terminal',
            description: 'UPI / NetBanking / Local Cards',
            icon: (
                <div className="flex gap-3 items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" alt="UPI" className="h-3 w-auto opacity-70 grayscale" />
                    <img src="https://cdn-icons-png.flaticon.com/512/60/60484.png" alt="Wallet" className="h-3 w-auto opacity-70 grayscale" />
                </div>
            )
        }
    ]

    // Fetch Saved Addresses
    useEffect(() => {
        if (user) {
            const fetchAddresses = async () => {
                const { data } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                if (data) {
                    setSavedAddresses(data)
                    if (data.length > 0) {
                        applyAddress(data[0])
                        setSelectedAddressId(data[0].id)
                    }
                }
            }
            fetchAddresses()
        }
    }, [user])

    const applyAddress = (addr) => {
        const nameParts = (addr.full_name || '').split(' ')
        const first = nameParts[0] || ''
        const last = nameParts.slice(1).join(' ') || ''

        setFormData(prev => ({
            ...prev,
            firstName: first,
            lastName: last,
            address: addr.address_line1 || '',
            city: addr.city || '',
            postalCode: addr.postal_code || '',
            country: addr.country || 'India',
            phone: addr.phone || ''
        }))
    }

    const handleAddressSelect = (addr) => {
        setSelectedAddressId(addr.id)
        applyAddress(addr)
    }

    const handleManualEntry = () => {
        setSelectedAddressId(null)
        setFormData(prev => ({
            ...prev,
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'India',
            phone: ''
        }))
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setErrorMessage(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage(null)

        try {
            // 1. Save Address
            if (shouldSaveAddress && user && !selectedAddressId) {
                await supabase.from('addresses').insert({
                    user_id: user.id,
                    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                    address_line1: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    state: '',
                    country: formData.country,
                    phone: formData.phone,
                    is_default: false
                })
            }

            if (paymentHub === 'razorpay') {
                // --- RAZORPAY FLOW ---
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    throw new Error("Razorpay SDK failed to load.");
                }

                const res = await fetch("/api/razorpay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: cartTotal, currency: currency }),
                });

                const razorpayOrder = await res.json();
                if (razorpayOrder.error) throw new Error(razorpayOrder.error);

                const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                if (!rzpKey) throw new Error("Razorpay Key Missing");

                const options = {
                    key: rzpKey,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: "Zoomers Archive",
                    description: "Terminal Transaction",
                    order_id: razorpayOrder.id,
                    prefill: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        contact: formData.phone,
                    },
                    theme: { color: "#000000" },
                    handler: async function (response) {
                        await finalizeOrder({
                            status: 'paid',
                            gateway: 'razorpay',
                            gatewayPaymentId: response.razorpay_payment_id,
                            gatewayOrderId: response.razorpay_order_id,
                            currency: 'INR',
                            response: response
                        });
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // --- STRIPE FLOW ---
                const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
                if (!stripe) throw new Error("Stripe Projection Failed");

                const res = await fetch("/api/stripe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: cartTotal,
                        currency: currency,
                        metadata: { email: formData.email }
                    }),
                });

                const { clientSecret, error } = await res.json();
                if (error) {
                    console.error("Stripe Checkout Error:", error);
                    throw new Error("Sorry Stripe Services Arent available for while");
                }

                const stripeResult = await stripe.confirmCardPayment(clientSecret);

                if (stripeResult.error) throw stripeResult.error;

                if (stripeResult.paymentIntent.status === 'succeeded') {
                    await finalizeOrder({
                        status: 'paid',
                        gateway: 'stripe',
                        gatewayPaymentId: stripeResult.paymentIntent.id,
                        currency: stripeResult.paymentIntent.currency.toUpperCase(),
                        response: stripeResult.paymentIntent
                    });
                }
            }

        } catch (err) {
            console.error(err)
            const msg = err.message || ''
            if (msg.includes("Stripe") || msg.includes("Key") || msg.includes("Integration") || msg.includes("available")) {
                setErrorMessage("Sorry Stripe Services Arent available for while")
            } else {
                setErrorMessage(err.message || 'Payment system error. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const finalizeOrder = async ({ status, gateway, gatewayPaymentId, gatewayOrderId = null, currency, response }) => {
        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    user_email: formData.email,
                    shipping_address: {
                        line1: formData.address,
                        city: formData.city,
                        postal_code: formData.postalCode,
                        country: formData.country,
                        first_name: formData.firstName,
                        last_name: formData.lastName
                    },
                    status,
                    total_amount: cartTotal,
                    currency,
                    payment_gateway: gateway,
                    gateway_payment_id: gatewayPaymentId,
                    gateway_order_id: gatewayOrderId,
                    metadata: { phone: formData.phone }
                })
                .select()
                .single()

            if (orderError) throw orderError

            const items = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                size: item.size,
                quantity: item.quantity,
                price: getProductPrice(item)
            }))

            const { error: itemsError } = await supabase.from('order_items').insert(items)
            if (itemsError) throw itemsError

            await supabase.from('transactions').insert({
                order_id: order.id,
                user_id: user?.id || null,
                amount: cartTotal,
                currency,
                status: 'success',
                gateway_id: gatewayPaymentId,
                payment_method: gateway === 'razorpay' ? 'razorpay' : 'card'
            })

            // TRIGGER EMAIL (Non-blocking)
            fetch('/api/orders/email-trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id })
            }).catch(err => console.error("Email trigger failed:", err))

            await clearCart()
            router.push(`/${region}/order/confirmation?id=${order.id}`)
        } catch (e) {
            console.error(e)
            setErrorMessage("Order synchronization failed. Please contact support.")
        }
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <p className="text-xl uppercase tracking-widest font-bold">Your cart is empty.</p>
                <button onClick={() => router.push(`/${region}/shop`)} className="mt-8 text-neutral-400 hover:text-black underline">Return to Shop</button>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-white text-black grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 px-6 md:px-12 py-12 lg:pt-24 lg:pr-24 flex flex-col">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Secure<br />Checkout
                    </h1>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-12 max-w-2xl">
                    {/* 01 CONTACT */}
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-4 mb-8 text-black/50">01. Contact Details</h2>
                        {user ? (
                            <div className="flex items-center justify-between p-6 bg-neutral-50 border border-black/5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono uppercase text-neutral-400">// Authenticated User</span>
                                    <span className="text-lg font-bold tracking-tight">{user.email}</span>
                                </div>
                                <div className="p-2 rounded-full bg-green-500/10">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600"><path d="M20 6L9 17L4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <input
                                    required type="email" name="email" placeholder=" "
                                    value={formData.email}
                                    className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg font-medium"
                                    onChange={handleChange}
                                />
                                <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">
                                    Email Address
                                </label>
                            </div>
                        )}
                    </section>

                    {/* 02 SHIPPING */}
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-4 mb-4 text-black/50">02. Shipping Info</h2>
                        {user && savedAddresses.length > 0 && (
                            <div className="mb-8">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-4">// Use Saved Protocol</span>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {savedAddresses.map((addr) => (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => handleAddressSelect(addr)}
                                            className={`min-w-[240px] text-left p-6 border transition-all relative ${selectedAddressId === addr.id
                                                ? 'border-black bg-white ring-1 ring-black shadow-xl'
                                                : 'border-neutral-200 bg-neutral-50 hover:border-black/30'
                                                }`}
                                        >
                                            {selectedAddressId === addr.id && (
                                                <div className="absolute top-0 right-0 p-2">
                                                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                            <span className="text-xs font-black uppercase tracking-tighter block mb-2">{addr.full_name}</span>
                                            <p className="text-[11px] leading-relaxed text-black/60 font-mono">
                                                {addr.address_line1},<br />
                                                {addr.city}, {addr.postal_code}
                                            </p>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleManualEntry}
                                        className={`min-w-[140px] flex flex-col items-center justify-center border border-dashed text-neutral-400 hover:text-black hover:border-black transition-all ${!selectedAddressId ? 'border-black bg-white text-black' : 'border-neutral-300'
                                            }`}
                                    >
                                        <span className="text-2xl mb-1">+</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">New Entry</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-8 transition-all duration-500 overflow-hidden" style={{ opacity: selectedAddressId ? 0.4 : 1, pointerEvents: selectedAddressId ? 'none' : 'auto' }}>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="group relative">
                                    <input required={!selectedAddressId} type="text" name="firstName" placeholder=" " value={formData.firstName} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                    <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">First Name</label>
                                </div>
                                <div className="group relative">
                                    <input required={!selectedAddressId} type="text" name="lastName" placeholder=" " value={formData.lastName} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                    <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Last Name</label>
                                </div>
                            </div>
                            <div className="group relative">
                                <input required={!selectedAddressId} type="text" name="address" placeholder=" " value={formData.address} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Address & Apt</label>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="group relative">
                                    <input required={!selectedAddressId} type="text" name="city" placeholder=" " value={formData.city} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                    <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">City</label>
                                </div>
                                <div className="group relative">
                                    <input required={!selectedAddressId} type="text" name="postalCode" placeholder=" " value={formData.postalCode} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                    <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Postal Code</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="group relative">
                                    <input required type="text" name="country" placeholder=" " readOnly value={formData.country} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none text-black/50 cursor-not-allowed text-lg" />
                                    <label className="absolute -top-4 text-black/40 text-[10px] uppercase tracking-widest pointer-events-none">Country</label>
                                </div>
                                <div className="group relative">
                                    <input required={!selectedAddressId} type="tel" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} className="peer w-full py-4 bg-transparent border-b-2 border-black/10 outline-none focus:border-black transition-colors text-lg" />
                                    <label className="absolute left-0 top-4 text-black/40 text-sm uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Phone</label>
                                </div>
                            </div>
                            {user && !selectedAddressId && (
                                <div className="flex items-center gap-3 pt-4">
                                    <input type="checkbox" id="save-address" checked={shouldSaveAddress} onChange={(e) => setShouldSaveAddress(e.target.checked)} className="w-4 h-4 border-black/20 rounded-sm" />
                                    <label htmlFor="save-address" className="text-xs uppercase tracking-wider font-bold text-black/60 cursor-pointer select-none">Save this protocol for future use</label>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 03 PAYMENT HUB - DUAL GATEWAY */}
                    <section className="mt-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-10 pb-4 border-b border-neutral-100 flex items-center justify-between">
                            03. Select Payment Gateway
                            <span className="text-black/20 font-mono tracking-normal pr-2">Secure Link Attached</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-4 mb-10">
                            {paymentOptions.filter(opt => opt.id === paymentHub).map((opt) => (
                                <div
                                    key={opt.id}
                                    className="relative p-6 text-left rounded-xl border border-black bg-black text-white shadow-xl cursor-default"
                                >
                                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                {opt.name}
                                            </span>
                                            <div className="w-4 h-4 rounded-full border border-white bg-white flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="grayscale-0 opacity-100 scale-110 origin-left">
                                                {opt.icon}
                                            </div>
                                            <p className="text-[9px] uppercase tracking-widest font-bold leading-relaxed opacity-60">
                                                {opt.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                </div>
                            ))}
                        </div>

                        {/* SECURITY NOTICE */}
                        <div className="flex items-center gap-4 px-6 py-4 bg-neutral-50 rounded-lg border border-neutral-100 opacity-60">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-neutral-500">
                                End-to-end encrypted protocol active. Standard {paymentHub === 'stripe' ? 'Global PCI' : 'RBI India'} compliance verified.
                            </p>
                        </div>
                    </section>

                    <div className="flex items-center justify-between mt-12 mb-24 relative">
                        {errorMessage && (
                            <div className="absolute -top-16 left-0 w-full p-3 border border-red-500 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center animate-pulse z-10">
                                {errorMessage}
                            </div>
                        )}
                        <div className="hidden md:flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Obligation</span>
                            <span className="text-2xl font-black tracking-tighter">{formatPrice(cartTotal)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-50 active:scale-95 shadow-xl md:w-auto w-full"
                        >
                            {loading ? 'Processing...' : `Place Order — ${formatPrice(cartTotal)}`}
                        </button>
                        <p className="absolute -bottom-8 w-full text-center text-[9px] uppercase tracking-widest text-neutral-400">
                            All charges are processed in {currency}.
                        </p>
                    </div>
                </form>
            </div>

            {/* SUMMARY RIGHT */}
            <div className="block lg:col-span-5 bg-[#050505] text-[#f4f4f5] p-6 md:p-12 lg:min-h-screen relative border-l border-white/5">
                <div className="sticky top-24 pr-12">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-8 pb-4 border-b border-white/10">Order Summary ({cart.length})</h2>
                    <div className="flex flex-col gap-6 mb-12 max-h-[60vh] overflow-y-auto no-scrollbar pr-4">
                        {cart.map((item, idx) => (
                            <div key={`${item.id}-${item.size}-${idx}`} className="flex gap-6 items-start group">
                                <div className="relative w-24 aspect-[4/5] bg-white/5 border border-white/10 shrink-0 overflow-hidden">
                                    <Image src={item.image_url} alt={item.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                                </div>
                                <div className="flex-1 py-1 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold uppercase tracking-tight text-white">{item.name}</h3>
                                        <span className="text-sm font-mono">{formatPrice(getProductPrice(item) * item.quantity)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-4 text-[11px] text-white/60 font-mono">
                                            <span className="bg-white/10 px-2 py-0.5 rounded-sm">SIZE {item.size}</span>
                                            <span className="bg-white/10 px-2 py-0.5 rounded-sm">QTY {item.quantity}</span>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id, item.size)} className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col gap-4">
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-white/40 uppercase tracking-widest">Subtotal</span>
                            <span className="font-mono text-white/80">{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-white/40 uppercase tracking-widest">Shipping</span>
                            <span className="font-mono text-green-400 uppercase text-[10px] tracking-widest">Free Express</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/20 pt-6 mt-4">
                            <span className="text-sm font-bold uppercase tracking-widest text-white">Total Due</span>
                            <div className="text-right">
                                <span className="text-3xl font-mono font-medium block leading-none">{formatPrice(cartTotal)}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">
                                    {currency === 'INR' ? 'Taxes included' : 'Duties and taxes calculated at checkout'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
