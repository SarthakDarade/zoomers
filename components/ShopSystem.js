'use client'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Hero from './Hero'
import CuratedView from './CuratedView'
import ExploreView from './ExploreView'
import { generateLayout } from '@/lib/patterns'
import { supabase } from '@/lib/supabase'

export default function ShopSystem({ initialProducts }) {
    const [viewMode, setViewMode] = useState('CURATED') // CURATED | EXPLORE
    const [allProducts, setAllProducts] = useState(initialProducts)
    const [rows, setRows] = useState([])
    const [loadingMore, setLoadingMore] = useState(false)

    // Initialize rows on mount
    useEffect(() => {
        const generatedRows = generateLayout(allProducts)
        setRows(generatedRows)
    }, [allProducts])

    // Transition Logic
    const handleExplore = () => {
        // Animate out Curated, animate in Explore
        // Simple state switch for now, but in reality we'd do a FLIP animation
        setViewMode('EXPLORE')
    }

    // Infinite Load Logic for Explore View
    const loadMoreItems = async (startIndex, stopIndex) => {
        if (loadingMore) return
        setLoadingMore(true)

        const start = allProducts.length
        const end = start + 50

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .range(start, end)
            .order('created_at', { ascending: true })

        if (data && data.length > 0) {
            setAllProducts(prev => [...prev, ...data])
        }
        setLoadingMore(false)
    }

    // Row count is NOT item count. 
    // We approximate total rows ? 
    // Let's just say totalItems = 1000 (conceptually)

    return (
        <main className="w-full bg-[#050505] min-h-screen text-[#f4f4f5]">
            <Hero />

            {viewMode === 'CURATED' && (
                <CuratedView products={allProducts} onExplore={handleExplore} />
            )}

            {viewMode === 'EXPLORE' && (
                <ExploreView
                    rows={rows}
                    isItemLoaded={(index) => !!rows[index]}
                    loadMoreItems={loadMoreItems}
                    totalItems={100} // Mock limit for now
                />
            )}

            {/* MODE INDICATOR */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none mix-blend-difference">
                <span className="text-[10px] uppercase tracking-widest opacity-50">System Status</span>
                <span className="text-sm font-bold uppercase tracking-widest">{viewMode}</span>
            </div>
        </main>
    )
}
