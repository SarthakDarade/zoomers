'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCurrency } from '@/context/CurrencyContext'

export default function Footer() {
    const { region } = useCurrency()

    return (
        <footer className="w-full bg-white text-black border-t border-black/10 flex flex-col pt-32 pb-12 overflow-hidden">

            {/* 1. NEWSLETTER HERO */}
            <div className="w-full max-w-2xl mx-auto text-center px-6 mb-32">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-6 block">Internal Comms</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                    Join the<br />Inner Circle.
                </h2>
                <div className="relative group">
                    <input
                        type="email"
                        placeholder="ENTER EMAIL ADDRESS"
                        className="w-full bg-transparent border-b-2 border-black/10 py-4 text-center text-xl font-mono uppercase tracking-widest outline-none focus:border-black transition-colors placeholder:text-black/20"
                    />
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Submit
                    </button>
                </div>
                <p className="mt-6 text-[10px] text-black/40 uppercase tracking-widest">
                    By subscribing you agree to our terms. Access granted upon verification.
                </p>
            </div>

            {/* 2. MASSIVE BRANDING */}
            <div className="w-full mb-12 border-y border-black/10">
                <div className="relative w-full h-[30vw]">
                    <Image
                        src="/branding.svg"
                        alt="ZOOMERS"
                        fill
                        className="object-contain" // Use object-cover if you want to force fill, but contain is safer for text. 30vw should be enough height.
                    />
                </div>
            </div>

            {/* 3. SITE PROTOCOL GRID */}
            <div className="max-w-[1800px] w-full mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-black/10">

                {/* COLUMN 1: ARCHIVE */}
                <div className="border-r border-black/10 p-8 flex flex-col justify-between h-64 hover:bg-black/5 transition-colors group relative overflow-hidden">
                    <div>
                        <h4 className="text-[9px] font-mono text-[#cd2b2b] uppercase tracking-widest mb-6">01 // Archive Protocol</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${region}/new-arrivals`} className="text-sm font-bold uppercase tracking-wide hover:text-[#cd2b2b] transition-colors flex items-center justify-between">
                                New Arrivals <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono">↗</span>
                            </Link>
                            <Link href={`/${region}/collections`} className="text-sm font-bold uppercase tracking-wide hover:text-[#cd2b2b] transition-colors flex items-center justify-between">
                                Full Collections <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono">↗</span>
                            </Link>
                            <Link href={`/${region}/shop`} className="text-sm font-bold uppercase tracking-wide hover:text-[#cd2b2b] transition-colors flex items-center justify-between">
                                Master Shop <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono">↗</span>
                            </Link>
                            <Link href={`/${region}/about`} className="text-sm font-bold uppercase tracking-wide hover:text-[#cd2b2b] transition-colors flex items-center justify-between">
                                About The Archive <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono">↗</span>
                            </Link>
                        </div>
                    </div>
                    <p className="text-[10px] text-black/40 font-mono leading-relaxed mt-auto max-w-[200px]">
                        Access verified artifacts and current seasonal drops.
                    </p>
                </div>

                {/* COLUMN 2: CLIENT OPS */}
                <div className="border-r border-black/10 p-8 flex flex-col justify-between h-64 hover:bg-black/5 transition-colors group">
                    <div>
                        <h4 className="text-[9px] font-mono text-black/40 uppercase tracking-widest mb-6">02 // Client Operations</h4>
                        <div className="flex flex-col gap-3">
                            <Link href={`/${region}/account`} className="text-xs font-mono uppercase tracking-widest hover:text-black transition-colors text-black/60">
                                [ Order Status ]
                            </Link>
                            <Link href={`/${region}/shipping-info`} className="text-xs font-mono uppercase tracking-widest hover:text-black transition-colors text-black/60">
                                [ Shipping Data ]
                            </Link>
                            <Link href={`/${region}/returns-portal`} className="text-xs font-mono uppercase tracking-widest hover:text-black transition-colors text-black/60">
                                [ Returns Portal ]
                            </Link>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-green-600">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                            Support Online
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: LEGAL FRAMWORK */}
                <div className="border-r border-black/10 p-8 flex flex-col justify-between h-64 hover:bg-black/5 transition-colors group">
                    <div>
                        <h4 className="text-[9px] font-mono text-black/40 uppercase tracking-widest mb-6">03 // Legal Framework</h4>
                        <div className="flex flex-col gap-2">
                            <Link href={`/${region}/privacy-policy`} className="flex items-center gap-3 text-xs w-full py-2 border-b border-black/5 hover:border-black/20 transition-colors">
                                <span className="w-1 h-1 bg-black/20 rounded-full"></span>
                                <span className="uppercase tracking-widest">Privacy Policy</span>
                            </Link>
                            <Link href={`/${region}/terms-of-service`} className="flex items-center gap-3 text-xs w-full py-2 border-b border-black/5 hover:border-black/20 transition-colors">
                                <span className="w-1 h-1 bg-black/20 rounded-full"></span>
                                <span className="uppercase tracking-widest">Terms of Service</span>
                            </Link>
                            <Link href={`/${region}/refund-policy`} className="flex items-center gap-3 text-xs w-full py-2 border-b border-black/5 hover:border-black/20 transition-colors">
                                <span className="w-1 h-1 bg-black/20 rounded-full"></span>
                                <span className="uppercase tracking-widest">Refund & Cancellation</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: NETWORK */}
                <div className="p-8 flex flex-col justify-between h-64 hover:bg-black/5 transition-colors group relative">
                    <div className="absolute top-0 right-0 p-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/10 group-hover:text-black/30 transition-colors"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-mono text-black/40 uppercase tracking-widest mb-6">04 // Global Network</h4>
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/zoomersoff" className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-all group/icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-all group/icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-all group/icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                            </Link>
                        </div>
                    </div>
                    <p className="text-[10px] text-black/40 font-mono mt-auto">
                        Connect to external signals.
                    </p>
                </div>

            </div>

            {/* 4. BASELINE */}
            <div className="max-w-[1800px] w-full mx-auto px-6 md:px-12 mt-24 flex justify-between items-end text-[9px] text-black/30 uppercase tracking-widest font-mono">
                <div>
                    Designed in London.<br />
                    Engineered for the Modern Uniform.
                </div>
                <div>
                    ©2026 Zoomers Archive System.
                </div>
            </div>

        </footer>
    )
}

