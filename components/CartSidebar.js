'use client'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import Image from 'next/image'
import Link from 'next/link'

export default function CartSidebar() {
    const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal } = useCart()
    const { getProductPrice, formatPrice, region } = useCurrency()

    return (
        <>
            {/* OVERLAY */}
            <div
                onClick={() => setIsCartOpen(false)}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            ></div>

            {/* SIDEBAR */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white text-black z-[100] transform transition-transform ease-premium shadow-2xl flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-black/10">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Your Cart ({cart.length})</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 flex items-center justify-center hover:opacity-50 transition-opacity"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral-400">
                            <span className="text-xs uppercase tracking-widest">Cart is empty</span>
                            <button onClick={() => setIsCartOpen(false)} className="text-black border-b border-black pb-1 text-xs uppercase tracking-widest">Start Browsing</button>
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={`${item.id}-${item.size}-${idx}`} className="flex gap-4">
                                {/* PRODUCT IMAGE */}
                                <div className="relative w-20 aspect-[3/4] bg-neutral-100 shrink-0">
                                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xs font-bold uppercase leading-relaxed tracking-wide pr-4">{item.name}</h3>
                                            <span className="text-xs font-mono">{formatPrice(getProductPrice(item) * item.quantity)}</span>
                                        </div>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Size: {item.size}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        {/* QUANTITY */}
                                        <div className="flex items-center border border-black/10">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-20"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center text-xs font-mono border-x border-black/10">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* REMOVE */}
                                        <button
                                            onClick={() => removeFromCart(item.id, item.size)}
                                            className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* FOOTER */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-black/10 bg-neutral-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Subtotal</span>
                            <span className="text-xl font-mono font-bold">{formatPrice(cartTotal)}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mb-6 text-center">Shipping & taxes calculated at checkout.</p>

                        <Link
                            href={`/${region}/checkout`}
                            onClick={() => setIsCartOpen(false)}
                            className="flex items-center justify-center w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
