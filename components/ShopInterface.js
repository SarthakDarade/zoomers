'use client'
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import { useCurrency } from '@/context/CurrencyContext'

export default function ShopInterface({ products }) {
    const searchParams = useSearchParams()
    const { region } = useCurrency()

    const router = useRouter()
    const initialCategory = searchParams.get('cat') || 'all'
    const initialSearch = searchParams.get('search') || ''

    const [category, setCategory] = useState(initialCategory)
    const [sortOption, setSortOption] = useState('newest') // newest, price-asc, price-desc
    const [gridView, setGridView] = useState('grid') // 'grid' | 'list'
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)

    // Update state if URL changes
    useEffect(() => {
        const cat = searchParams.get('cat')
        if (cat) setCategory(cat)
    }, [searchParams])

    const handleCategoryChange = (newCat) => {
        setCategory(newCat)
        // Use region in router push
        router.push(`/${region}/shop?cat=${newCat}`, { scroll: false })
    }

    // --- FILTER & SORT LOGIC ---
    const processedProducts = useMemo(() => {
        let result = [...products]

        // 0. Filter by Search Query
        const query = searchParams.get('search')?.toLowerCase()
        if (query) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            )
        }

        // 1. Filter by Category
        if (category !== 'all') {
            const keywords = {
                outerwear: ['jacket', 'coat', 'parka', 'shell', 'windbreaker', 'trench'],
                tops: ['shirt', 'tee', 'knit', 'hoodie', 'sweater', 'vest', 'pullover'],
                bottoms: ['pant', 'trouser', 'short', 'jean', 'cargo', 'legging', 'sweatpant'],
                footwear: ['boot', 'shoe', 'sneaker', 'runner', 'trainer', 'sandal'],
                accessories: ['hat', 'cap', 'bag', 'sock', 'belt', 'scarf']
            }
            const targetKeywords = keywords[category.toLowerCase()] || []
            result = result.filter(p => {
                const text = (p.name + ' ' + p.description).toLowerCase()
                return targetKeywords.some(k => text.includes(k))
            })
        }

        // 2. Sort
        if (sortOption === 'price-asc') {
            result.sort((a, b) => a.price - b.price)
        } else if (sortOption === 'price-desc') {
            result.sort((a, b) => b.price - a.price)
        } else {
            // Default to newest (using created_at or ID as proxy)
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }

        return result
    }, [products, category, sortOption, searchParams])


    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#fafafa] text-black">

            {/* SIDEBAR FILTER (Sticky) */}
            <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-black/5 bg-white md:sticky md:top-0 md:h-screen md:overflow-y-auto z-40 no-scrollbar">
                <div className="p-6 md:p-8 md:pt-32 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4 md:mb-8">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-1">Shop</h1>
                            <p className="text-xs text-neutral-500">Zoomers Archive System™</p>
                        </div>
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="md:hidden text-xs font-bold uppercase tracking-widest border border-black/10 px-3 py-2 rounded-sm"
                        >
                            {isFiltersOpen ? 'Hide Filters' : 'Filter / Sort'}
                        </button>
                    </div>

                    {/* Collapsible Content on Mobile */}
                    <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block flex-1 flex flex-col`}>

                        {/* CATEGORIES */}
                        <div className="mb-8">
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-4">Collection</h3>
                            <nav className="flex flex-col gap-1">
                                {['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat.toLowerCase())}
                                        className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors ${category === cat.toLowerCase()
                                            ? 'bg-black text-white font-medium'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* SORTING */}
                        <div className="mb-8">
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-4">Sort By</h3>
                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 text-sm p-2 rounded-md focus:outline-none focus:border-black appearance-none cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow"></div>

                        {/* REASSURANCE (Bottom of Sidebar) */}
                        <div className="mt-8 pt-8 border-t border-black/5 text-xs text-neutral-500 space-y-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-black mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <div>
                                    <p className="font-medium text-black">Global Shipping</p>
                                    <p className="text-[10px] opacity-70">Complimentary on orders over $500</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-black mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <p className="font-medium text-black">Authenticity Guaranteed</p>
                                    <p className="text-[10px] opacity-70">Verified Archive Pieces</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>


            {/* MAIN GRID */}
            <main className="flex-1 w-full min-h-screen pt-24 md:pt-32 px-6 md:px-12 pb-24 bg-[#fafafa]">

                {/* HEADER INFO */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
                    <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                             // System Archive
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
                            {searchParams.get('search')
                                ? `Search: "${searchParams.get('search')}"`
                                : category === 'all' ? 'All Artifacts' : category}
                        </h2>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 hidden md:block">
                            View Mode [{gridView.toUpperCase()}]
                        </span>
                        <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                            <button
                                onClick={() => setGridView('grid')}
                                className={`p-1.5 rounded-md transition-all ${gridView === 'grid' ? 'bg-black text-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                            </button>
                            <button
                                onClick={() => setGridView('list')}
                                className={`p-1.5 rounded-md transition-all ${gridView === 'list' ? 'bg-black text-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" rx="1" /><rect x="3" y="11" width="18" height="2" rx="1" /><rect x="3" y="17" width="18" height="2" rx="1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={category + sortOption + gridView + (searchParams.get('search') || '')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={
                            gridView === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12"
                                : "flex flex-col gap-2"
                        }
                    >
                        {processedProducts.map(product => (
                            <ProductItem key={product.id} product={product} view={gridView} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {processedProducts.length === 0 && (
                    <div className="py-32 text-center">
                        <p className="text-neutral-400">
                            {searchParams.get('search')
                                ? `No results found for "${searchParams.get('search')}"`
                                : "No products found in this category."}
                        </p>
                        <button onClick={() => {
                            router.push(`/${region}/shop`)
                            handleCategoryChange('all')
                        }} className="mt-4 text-sm font-medium text-black underline underline-offset-4">
                            Clear Filters & View All
                        </button>
                    </div>
                )}
            </main>

        </div>
    )
}


function ProductItem({ product, view }) {
    const { getProductPrice, formatPrice, region } = useCurrency()
    const price = getProductPrice(product)

    if (view === 'list') {
        return (
            <Link href={`/${region}/product/${product.id}`} className="group flex items-center justify-between p-4 bg-white border border-neutral-100 hover:border-black transition-all duration-300">
                <div className="flex items-center gap-6">
                    <div className="text-xs font-mono text-neutral-300 w-8">0{product.id}</div>
                    <div className="relative w-12 h-16 bg-neutral-100 overflow-hidden">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wide">{product.name}</h3>
                        <p className="text-[10px] text-neutral-500 font-mono uppercase">{product.function}</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <span className="text-xs font-mono text-neutral-400 hidden md:block">IN STOCK</span>
                    <p className="text-sm font-medium text-black font-mono">{formatPrice(price)}</p>
                </div>
            </Link>
        )
    }

    // GRID VIEW - TECH FASHION ESTHETIC
    return (
        <Link href={`/${region}/product/${product.id}`} className="group block relative">
            <div className="relative aspect-[3/4] bg-[#f0f0f0] overflow-hidden mb-3 border border-transparent group-hover:border-black transition-colors duration-300">
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />

                {/* SYSTEM OVERLAY (Visible by Hover) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {/* Crosshairs */}
                    <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white"></div>
                    <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white"></div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white"></div>

                    {/* Center Scan Line */}
                    <div className="absolute inset-0 bg-white/5"></div>

                    {/* Meta Data */}
                    <div className="absolute top-4 left-0 w-full text-center">
                        <span className="bg-black text-white text-[9px] font-mono px-1 py-0.5 uppercase tracking-widest">
                            Scanning
                        </span>
                    </div>

                    {/* Shop Button */}
                    <div className="absolute bottom-4 right-4">
                        <span className="bg-[#cd2b2b] text-white text-[10px] font-bold uppercase px-3 py-1.5 tracking-wider flex items-center gap-2">
                            Acquire <span className="text-[8px]">→</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-tight group-hover:underline decoration-1 underline-offset-4">
                        {product.name}
                    </h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5 font-mono uppercase">{product.function || 'Standard Issue'}</p>
                </div>
                <span className="text-sm text-black font-mono font-medium">{formatPrice(price)}</span>
            </div>
        </Link>
    )
}
