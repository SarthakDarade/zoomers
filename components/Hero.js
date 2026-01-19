'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCurrency } from '@/context/CurrencyContext'

export default function Hero() {
    const [offset, setOffset] = useState(0)
    const { region } = useCurrency()

    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <section className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#f4f4f5]">

            {/* PARALLAX BACKGROUND */}
            <div className="absolute inset-0 z-0" style={{ transform: `translateY(${offset * 0.5}px)` }}>
                <Image
                    src="https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?q=80&w=2400&auto=format&fit=crop"
                    alt="Campaign"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity scale-105"
                    priority
                />
                {/* NOISE OVERLAY */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            {/* LIVE STATUS - TOP LEFT */}
            <div className="absolute top-24 left-6 md:left-12 z-20 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">
                    London Atelier • Live
                </span>
            </div>

            {/* CENTER PIECE */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end pb-32 px-6 md:px-12">

                {/* MANIFESTO */}
                <div className="max-w-4xl">
                    <h1 className="text-[14vw] leading-[0.8] font-black uppercase tracking-tighter mix-blend-difference text-white mb-6">
                        Zoomers
                        <span className="block text-4xl md:text-6xl tracking-widest font-thin italic font-serif mt-2 text-white/80">
                            Archive System™
                        </span>
                    </h1>
                </div>

                {/* BOTTOM BAR */}
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-white/20 pt-8 mt-12 backdrop-blur-sm">
                    <div className="max-w-md mb-8 md:mb-0">
                        <p className="text-xs md:text-sm font-mono text-white/70 leading-relaxed uppercase tracking-wide">
                            Engineered for the digital avant-garde. <br />
                            Constructed in London. Dispatched Globally.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href={`/${region}/new-arrivals`}
                            className="group relative px-8 py-4 bg-white text-black overflow-hidden"
                        >
                            <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">
                                Enter Archive
                            </span>
                            <div className="absolute inset-0 bg-[#cd2b2b] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"></div>
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    )
}
