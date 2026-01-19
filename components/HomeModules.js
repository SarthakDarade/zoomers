'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCurrency } from '@/context/CurrencyContext'

gsap.registerPlugin(ScrollTrigger)

// --- LIVE TICKER COMPONENT ---
export function LiveTicker() {
    return (
        <div className="w-full bg-[#cd2b2b] text-white overflow-hidden py-3 border-y border-[#cd2b2b]">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 mx-4">
                        <span className="text-xs font-bold uppercase tracking-widest">
                            Live from London
                        </span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        <span className="text-xs font-mono uppercase tracking-widest opacity-80">
                            New Archive Drop: 04.24.26
                        </span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        <span className="text-xs font-bold uppercase tracking-widest">
                            Global Shipping
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}


// --- FEATURED DROP COMPONENT ---
export function FeaturedDrop() {
    const { region } = useCurrency()
    // Using verified Unsplash IDs that are reliable
    const products = [
        { id: 101, name: "Shell Parka", price: 850, image: "https://images.unsplash.com/photo-1617615068863-b588af542203?auto=format&fit=crop&q=80&w=800", status: "Low Stock" },
        { id: 102, name: "Combat Boot", price: 620, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800", status: "Selling Fast" },
        { id: 103, name: "Tech Knit", price: 450, image: "https://images.unsplash.com/photo-1654111069497-dfd4afcff006?auto=format&fit=crop&q=80&w=800", status: "Just Dropped" },
    ]

    return (
        <section className="py-24 px-6 md:px-12 bg-white text-black border-b border-black/10">
            <div className="flex justify-between items-end mb-12">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    The<br />Drop
                </h2>
                <Link href={`/${region}/new-arrivals`} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">
                    View All Arrivals
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p, i) => (
                    <Link href={`/${region}/product/${p.id}`} key={p.id} className="group relative block aspect-[3/4] overflow-hidden bg-[#f4f4f5]">
                        <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105"
                        />

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-[#cd2b2b] text-white text-[9px] font-bold uppercase px-2 py-1 tracking-widest">
                                {p.status}
                            </span>
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex justify-between items-end">
                            <div>
                                <h3 className="text-white text-xl font-black uppercase tracking-tight">{p.name}</h3>
                                <span className="text-white/80 font-mono text-sm">${p.price}</span>
                            </div>
                            <span className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-full">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}


// --- INTERACTIVE CATEGORY NAV COMPONENT ---
export function InteractiveCategoryNav() {
    const { region } = useCurrency()
    const categories = [
        { name: "Outerwear", link: `/${region}/shop?cat=outerwear`, count: "24 Items", img: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&q=80&w=800" },
        { name: "Tops", link: `/${region}/shop?cat=tops`, count: "42 Items", img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80&w=800" },
        { name: "Bottoms", link: `/${region}/shop?cat=bottoms`, count: "18 Items", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800" },
        { name: "Footwear", link: `/${region}/shop?cat=footwear`, count: "08 items", img: "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?auto=format&fit=crop&q=80&w=800" },
    ]

    return (
        <section className="bg-[#050505] text-white py-24 px-6 md:px-12 border-t border-white/10">
            <div className="mb-12 flex justify-between items-end">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                    System<br />Navigation
                </h2>
                <p className="text-xs font-mono text-white/50 w-48 text-right">
                    Select a module to begin archive extraction.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 h-[600px] md:h-[500px]">
                {categories.map((cat, i) => (
                    <Link
                        href={cat.link}
                        key={i}
                        className="relative group border border-white/10 overflow-hidden flex flex-col justify-between p-6 hover:border-white/40 transition-colors"
                    >
                        {/* BACKGROUND IMAGES (Visible by default) */}
                        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105">
                            <Image
                                src={cat.img}
                                alt={cat.name}
                                fill
                                className="object-cover grayscale"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 z-10"></div>

                        {/* CONTENT */}
                        <div className="relative z-20 flex justify-between items-start">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#cd2b2b]">0{i + 1}</span>
                            <span className="w-2 h-2 rounded-full border border-white/30 group-hover:bg-[#cd2b2b] group-hover:border-[#cd2b2b] transition-colors"></span>
                        </div>

                        <div className="relative z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{cat.name}</h3>
                            <div className="h-0 overflow-hidden group-hover:h-6 transition-all duration-300">
                                <span className="text-xs font-mono text-white/60">{cat.count}</span>
                            </div>
                        </div>

                        {/* HOVER ARROW */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <span className="w-12 h-12 rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
