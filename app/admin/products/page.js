'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        name: '',
        function: 'Apparel',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1594969155368-f19485a9d88c?auto=format&fit=crop&q=80',
        image_url_2: '',
        price_usd: 0,
        price_gbp: 0,
        price_eur: 0,
        price_inr: 0
    })

    // New: Track last edited currency to know which one is the "Source"
    const [lastEditedCurrency, setLastEditedCurrency] = useState('INR')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        if (data) setProducts(data)
        setLoading(false)
    }

    const handleOpenCreate = () => {
        setIsEditing(false)
        setCurrentProduct({
            id: null,
            name: '',
            function: 'Apparel',
            description: '',
            image_url: 'https://images.unsplash.com/photo-1594969155368-f19485a9d88c?auto=format&fit=crop&q=80',
            image_url_2: '',
            price_usd: 0,
            price_gbp: 0,
            price_eur: 0,
            price_inr: 0,
            stock_quantity: 100,
            available_regions: ['in', 'us', 'gb', 'eu'],
            is_new_arrival: false
        })
        setLastEditedCurrency('INR') // Default
        setShowModal(true)
    }

    const handleOpenEdit = (product) => {
        setIsEditing(true)
        setCurrentProduct({
            ...product,
            image_url_2: product.image_url_2 || '',
            price_inr: product.price_inr || 0,
            stock_quantity: product.stock_quantity ?? 100,
            available_regions: product.available_regions || ['in', 'us', 'gb', 'eu'],
            is_new_arrival: product.is_new_arrival || false
        })
        setLastEditedCurrency('INR') // Default
        setShowModal(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setCurrentProduct(prev => ({ ...prev, [name]: value }))

        // Detect currency edit
        if (name.startsWith('price_')) {
            const currency = name.split('_')[1].toUpperCase()
            setLastEditedCurrency(currency)
        }
    }

    const syncPrices = async () => {
        const basePrice = currentProduct[`price_${lastEditedCurrency.toLowerCase()}`]

        if (!basePrice) return alert(`Please enter ${lastEditedCurrency} Price first.`)

        try {
            // Fetch live rates for the BASE currency
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${lastEditedCurrency}`)
            const data = await res.json()

            if (data && data.rates) {
                const newPrices = {}

                // Calculate target currencies
                if (lastEditedCurrency !== 'USD') newPrices.price_usd = Math.round(basePrice * (data.rates.USD || 0))
                if (lastEditedCurrency !== 'GBP') newPrices.price_gbp = Math.round(basePrice * (data.rates.GBP || 0))
                if (lastEditedCurrency !== 'EUR') newPrices.price_eur = Math.round(basePrice * (data.rates.EUR || 0))
                if (lastEditedCurrency !== 'INR') newPrices.price_inr = Math.round(basePrice * (data.rates.INR || 0))

                setCurrentProduct(prev => ({
                    ...prev,
                    ...newPrices
                }))
            }
        } catch (error) {
            console.error("FX Sync failed", error)
            alert("Auto-Sync failed completely. API may be down.")
        }
    }

    const handleSubmit = async () => {
        // Validation
        if (!currentProduct.name || !currentProduct.price_usd) return alert('Name and Base Price required.')

        // Close Modal immediately for optimistic feel
        setShowModal(false)

        // Prepare Payload
        const payload = {
            name: currentProduct.name,
            function: currentProduct.function,
            description: currentProduct.description,
            image_url: currentProduct.image_url,
            image_url_2: currentProduct.image_url_2,
            price_usd: currentProduct.price_usd,
            price_gbp: currentProduct.price_gbp,
            price_eur: currentProduct.price_eur,
            price_inr: currentProduct.price_inr,
            available_regions: currentProduct.available_regions,
            stock_quantity: currentProduct.stock_quantity,
            is_new_arrival: currentProduct.is_new_arrival
        }

        if (isEditing) {
            // Optimistic Update
            setProducts(prev => prev.map(p => p.id === currentProduct.id ? { ...p, ...payload } : p))

            const { error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', currentProduct.id)

            if (error) {
                console.error(error)
                alert("Failed to update.")
                fetchProducts() // Revert
            }
        } else {
            // Create
            const { data, error } = await supabase
                .from('products')
                .insert([payload])
                .select()

            if (error) {
                console.error(error)
                alert("Failed to create.")
            } else if (data) {
                setProducts([data[0], ...products])
            }
        }
    }

    if (loading) return <div className="text-white/40">Loading Inventory...</div>

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Product Mainframe</h2>
                <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    New Artifact
                </button>
            </header>

            <div className="overflow-x-auto border border-white/10 rounded-lg">
                <table className="w-full text-left text-sm text-white/60">
                    <thead className="bg-white/5 uppercase text-[10px] font-bold tracking-widest text-white/40">
                        <tr>
                            <th className="px-6 py-4">Artifact</th>
                            <th className="px-6 py-4">Price (USD)</th>
                            <th className="px-6 py-4">Price (GBP)</th>
                            <th className="px-6 py-4">Price (EUR)</th>
                            <th className="px-6 py-4">Price (INR)</th>
                            <th className="px-6 py-4 text-right">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-12 bg-white/10 relative overflow-hidden group-hover:scale-105 transition-transform">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={product.image_url} alt="" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold uppercase">{product.name}</div>
                                            <div className="text-[10px] uppercase">{product.function || 'Standard Issue'}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 font-mono text-white/60">${product.price_usd}</td>
                                <td className="px-6 py-4 font-mono text-white/60">£{product.price_gbp}</td>
                                <td className="px-6 py-4 font-mono text-white/60">€{product.price_eur}</td>
                                <td className="px-6 py-4 font-mono text-white font-bold">₹{product.price_inr}</td>

                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleOpenEdit(product)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/40 px-3 py-1 rounded transition-all"
                                    >
                                        Edit Data
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* UNIVERSAL EDIT/CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/20 w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                                {isEditing ? 'Modify Artifact' : 'Initialize New Artifact'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Name</label>
                                <input name="name" value={currentProduct.name} onChange={handleChange} placeholder="e.g. EXO-SUIT V1" className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Category</label>
                                    <input name="function" value={currentProduct.function} onChange={handleChange} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Stock Level</label>
                                    <input type="number" name="stock_quantity" value={currentProduct.stock_quantity ?? 100} onChange={handleChange} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Regional Availability</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['in', 'us', 'gb', 'eu'].map(region => (
                                        <label key={region} className={`flex items-center justify-center p-3 border cursor-pointer transition-all ${(currentProduct.available_regions || []).includes(region)
                                            ? 'bg-white text-black border-white'
                                            : 'bg-black text-white/40 border-white/20 hover:border-white/60'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={(currentProduct.available_regions || []).includes(region)}
                                                onChange={() => {
                                                    const current = currentProduct.available_regions || []
                                                    const updated = current.includes(region)
                                                        ? current.filter(r => r !== region)
                                                        : [...current, region]
                                                    setCurrentProduct(prev => ({ ...prev, available_regions: updated }))
                                                }}
                                            />
                                            <span className="text-xs font-bold uppercase">{region.toUpperCase()}</span>
                                        </label>
                                    ))}
                                </div>

                                <label className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${currentProduct.is_new_arrival
                                    ? 'bg-green-500/10 border-green-500 text-green-400'
                                    : 'bg-black border-white/20 text-white/40 hover:border-white/60'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={currentProduct.is_new_arrival || false}
                                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                                        />
                                        <div className={`w-3 h-3 rounded-full border ${currentProduct.is_new_arrival ? 'bg-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'border-current'}`}></div>
                                        <span className="text-xs font-bold uppercase tracking-widest">Mark as New Arrival?</span>
                                    </div>
                                    <span className="text-[9px] font-mono uppercase opacity-70">
                                        {currentProduct.is_new_arrival ? 'FEATURED ON HOMEPAGE' : 'STANDARD LISTING'}
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Image URL</label>
                                <input name="image_url" value={currentProduct.image_url} onChange={handleChange} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Image URL 2</label>
                                <input name="image_url_2" value={currentProduct.image_url_2 || ''} onChange={handleChange} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Description</label>
                                <textarea name="description" value={currentProduct.description} onChange={handleChange} rows={3} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-white transition-colors outline-none" />
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pricing Matrix</span>
                                        <span className="text-[9px] font-mono text-white/20 px-2 py-0.5 border border-white/10 rounded">Source: {lastEditedCurrency}</span>
                                    </div>
                                    <button
                                        onClick={syncPrices}
                                        className="text-[10px] text-green-400 border border-green-500/20 px-2 py-1 rounded hover:bg-green-500/10 transition-colors uppercase font-bold tracking-wider flex items-center gap-2"
                                    >
                                        <span>Auto-Sync</span>
                                        <span className="text-[8px] opacity-70">to all</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${lastEditedCurrency === 'USD' ? 'text-green-400' : 'text-white/40'}`}>USD ($)</label>
                                        <input type="number" name="price_usd" value={currentProduct.price_usd} onChange={handleChange} className={`w-full bg-black border text-white p-2 text-sm text-right focus:border-white transition-colors outline-none ${lastEditedCurrency === 'USD' ? 'border-green-500/40 text-green-400' : 'border-white/20'}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${lastEditedCurrency === 'GBP' ? 'text-green-400' : 'text-white/40'}`}>GBP (£)</label>
                                        <input type="number" name="price_gbp" value={currentProduct.price_gbp} onChange={handleChange} className={`w-full bg-black border text-white p-2 text-sm text-right focus:border-white transition-colors outline-none ${lastEditedCurrency === 'GBP' ? 'border-green-500/40 text-green-400' : 'border-white/20'}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${lastEditedCurrency === 'EUR' ? 'text-green-400' : 'text-white/40'}`}>EUR (€)</label>
                                        <input type="number" name="price_eur" value={currentProduct.price_eur} onChange={handleChange} className={`w-full bg-black border text-white p-2 text-sm text-right focus:border-white transition-colors outline-none ${lastEditedCurrency === 'EUR' ? 'border-green-500/40 text-green-400' : 'border-white/20'}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${lastEditedCurrency === 'INR' ? 'text-green-400' : 'text-white/40'}`}>INR (₹)</label>
                                        <input type="number" name="price_inr" value={currentProduct.price_inr} onChange={handleChange} className={`w-full bg-black border text-white p-2 text-sm text-right focus:border-white transition-colors outline-none ${lastEditedCurrency === 'INR' ? 'border-green-500/40 text-green-400' : 'border-white/20'}`} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 mt-6 bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                            >
                                {isEditing ? 'Save Modifications' : 'Deploy to Grid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
