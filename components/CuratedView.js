'use client'
import { useState, useMemo } from 'react'
import ProductShowcase from './ProductShowcase'
import { gsap } from 'gsap'

export default function CuratedView({ products, onExplore }) {
    const limitedProducts = useMemo(() => products.slice(0, 12), [products])

    return (
        <div className="relative w-full">
            <ProductShowcase products={limitedProducts} />

            {/* THE TRIGGER */}
            <div className="w-full pb-32 flex flex-col items-center justify-center gap-6 relative z-30">
                <p className="text-white/40 text-xs uppercase tracking-[0.3em]">
                    System Limit Reached
                </p>
                <button
                    onClick={onExplore}
                    className="group relative px-12 py-4 border border-white/20 hover:border-white/100 transition-colors duration-500 rounded-full overflow-hidden"
                >
                    <span className="relative z-10 text-sm uppercase tracking-widest text-white mix-blend-difference">
                        Initialize Full Archive
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></div>
                </button>
            </div>
        </div>
    )
}
