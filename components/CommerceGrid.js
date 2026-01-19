'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
// Note: We are switching back to standard Grid for "Flagship" feel rather than infinite scroll for now.
// Actually, let's keep it simple: Standard CSS Grid. E-commerce sites usually paginate or "Load More".
// Infinite scroll is good but sometimes feels like "Social Media".
// Let's stick to a clean 4-col grid with "Load More".

export default function CommerceGrid({ initialProducts }) {
    const [products, setProducts] = useState(initialProducts)
    const [visibleCount, setVisibleCount] = useState(12)

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12)
    }

    return (
        <section className="w-full bg-white px-6 md:px-12 py-24">

            {/* HEADER & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-neutral-100 pb-6 sticky top-20 bg-white/95 backdrop-blur-sm z-30 pt-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">All Products</h2>
                    <span className="text-xs text-neutral-500 uppercase tracking-widest">{products.length} Items</span>
                </div>

                <div className="flex gap-8 mt-4 md:mt-0">
                    <button className="text-xs font-bold uppercase tracking-widest border-b border-black">View All</button>
                    <button className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">Outerwear</button>
                    <button className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">Tops</button>
                    <button className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">Bottoms</button>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                {products.slice(0, visibleCount).map((product, i) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* LOAD MORE */}
            {visibleCount < products.length && (
                <div className="mt-24 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-12 py-4 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                        Load More Products
                    </button>
                </div>
            )}
        </section>
    )
}
