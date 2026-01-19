'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()
    const [path, setPath] = useState('')

    useEffect(() => {
        setPath(window.location.pathname)
    }, [])

    return (
        <div className="min-h-screen w-full bg-[#050505] text-[#f4f4f5] flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono selection:bg-[#cd2b2b] selection:text-white">

            {/* GRID BACKGROUND (Subtle) */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* SCANLINE (Optional CSS animation could go here, keeping it static for performance) */}

            <div className="relative z-10 max-w-2xl w-full flex flex-col items-start">

                {/* ID TAG */}
                <div className="border border-neutral-800 bg-neutral-900/50 px-3 py-1 mb-8 inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">System Error • 0x404</span>
                </div>

                {/* MAIN HEADER */}
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-2 glitch-text leading-none">
                    VOID
                </h1>

                <div className="h-px w-full bg-white/20 my-8"></div>

                {/* TECH ERROR REPORT */}
                <div className="flex flex-col gap-4 text-xs md:text-sm text-neutral-400 font-mono w-full">
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                        <span>ERROR_CODE</span>
                        <span className="text-red-500">ERR_ARCHIVE_MISSING</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                        <span>REQUESTED_PATH</span>
                        <span className="text-white/70 max-w-[200px] truncate">{path}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                        <span>SEVERITY</span>
                        <span>NON_CRITICAL</span>
                    </div>
                    <div className="mt-4 text-neutral-500 leading-relaxed">
                        The artifacts you are attempting to locate have either been declassified, moved, or never existed within the Zoomers Archive System™.
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-12 flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all duration-300 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Revert
                    </button>

                    <Link
                        href="/"
                        className="px-8 py-4 bg-[#cd2b2b] border border-[#cd2b2b] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-600 transition-colors text-center"
                    >
                        Return to Archive
                    </Link>
                </div>

            </div>

            {/* FOOTER */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between text-[10px] text-neutral-600 uppercase tracking-widest font-mono">
                <span>Zoomers Archive System™</span>
                <span>London, UK</span>
            </div>

        </div>
    )
}
