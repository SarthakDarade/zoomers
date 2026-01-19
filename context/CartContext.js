'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

import { useCurrency } from '@/context/CurrencyContext'

const CartContext = createContext()


export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { user } = useAuth()
    const { getProductPrice, currency } = useCurrency()

    // 1. Load from DB on Login or Local Storage on Mount + REFRESH PRICES
    useEffect(() => {
        const loadCart = async () => {
            let initialCart = []

            if (user) {
                // Fetch from Supabase DB
                const { data, error } = await supabase
                    .from('cart_items')
                    .select('*')

                if (data && !error) {
                    initialCart = data.map(item => ({
                        id: item.product_id,
                        size: item.size,
                        quantity: item.quantity,
                        ...item.product_data
                    }))
                }
            } else {
                // Load Guest Cart
                const saved = localStorage.getItem('zoomers_cart')
                if (saved) {
                    try {
                        initialCart = JSON.parse(saved)
                    } catch (e) {
                        console.error("Cart Parse Error", e)
                        initialCart = []
                    }
                }
            }

            // SELF-HEALING: Fetch fresh prices to ensure no 0 or stale data
            if (initialCart.length > 0) {
                const ids = [...new Set(initialCart.map(item => item.id))]
                const { data: freshProducts } = await supabase
                    .from('products')
                    .select('id, name, price_inr, price_usd, price_gbp, price_eur, image_url')
                    .in('id', ids)

                if (freshProducts) {
                    initialCart = initialCart.map(item => {
                        const fresh = freshProducts.find(p => p.id == item.id)
                        if (fresh) {
                            // Merge fresh data, keeping size/qty/id from cart item
                            return {
                                ...item,
                                ...fresh, // Overwrites stale prices/names/images
                                id: item.id // Ensure ID remains as is (though it should match)
                            }
                        }
                        return item
                    })
                }
            }

            setCart(initialCart)
        }
        loadCart()
    }, [user])

    // Helper to clear cart (both local and DB)
    const clearCart = async () => {
        setCart([])
        localStorage.removeItem('zoomers_cart')
        if (user) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
        }
    }

    // 2. persist to Local Storage (Backup)
    useEffect(() => {
        if (!user) {
            localStorage.setItem('zoomers_cart', JSON.stringify(cart))
        }
    }, [cart, user])

    const addToCart = async (product, size) => {
        // Optimistic Update
        let newCart = []
        setCart(prev => {
            const existing = prev.find(item => item.id == product.id && item.size === size)
            if (existing) {
                newCart = prev.map(item =>
                    (item.id == product.id && item.size === size)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
                return newCart
            }
            newCart = [...prev, { ...product, size, quantity: 1 }]
            return newCart
        })
        setIsCartOpen(true)

        // DB Sync
        if (user) {
            const existingItem = cart.find(i => i.id == product.id && i.size === size)

            if (existingItem) {
                // Update Quantity
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existingItem.quantity + 1 })
                    .eq('user_id', user.id)
                    .eq('product_id', String(product.id))
                    .eq('size', size)
            } else {
                // Insert New
                const { error } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: String(product.id),
                        size: size,
                        quantity: 1,
                        product_data: {
                            name: product.name,
                            image_url: product.image_url,
                            function: product.function,
                            price: product.price,
                            price_usd: product.price_usd,
                            price_gbp: product.price_gbp,
                            price_eur: product.price_eur,
                            price_aed: product.price_aed
                        }
                    })
            }
        }
    }

    const removeFromCart = async (itemId, size) => {
        setCart(prev => prev.filter(item => !(item.id == itemId && item.size === size)))

        if (user) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', String(itemId))
                .eq('size', size)
        }
    }

    const updateQuantity = async (itemId, size, delta) => {
        let newQty = 0
        setCart(prev => prev.map(item => {
            if (item.id == itemId && item.size === size) {
                newQty = item.quantity + delta
                return newQty > 0 ? { ...item, quantity: newQty } : item
            }
            return item
        }))

        if (user && newQty > 0) {
            await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('user_id', user.id)
                .eq('product_id', String(itemId))
                .eq('size', size)
        }
    }

    const cartTotal = cart.reduce((total, item) => total + (getProductPrice(item) * item.quantity), 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
