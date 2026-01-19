'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Loading() {
    const [progress, setProgress] = useState(0)
    const [statusText, setStatusText] = useState('INITIALIZING')

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + Math.random() * 5
            })
        }, 100)

        // Dynamic status updates
        const timer1 = setTimeout(() => setStatusText('FETCHING ARTIFACTS'), 800)
        const timer2 = setTimeout(() => setStatusText('CALIBRATING SIZES'), 1600)
        const timer3 = setTimeout(() => setStatusText('RENDERING SYSTEM'), 2400)

        return () => {
            clearInterval(interval)
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [])

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex flex-col items-center justify-center overflow-hidden">

            {/* BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="relative z-10 w-full max-w-md px-12 flex flex-col items-center">

                {/* LOGO / BRAND */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="w-16 h-16 border border-white/20 mx-auto flex items-center justify-center rotate-45 mb-6">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-md"></div>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Zoomers</h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] mt-1">Archive System</p>
                </motion.div>

                {/* PROGRESS BAR - TAPE MEASURE STYLE */}
                <div className="w-full relative h-12 flex items-center justify-center overflow-hidden mb-8 border-y border-white/10">
                    <div className="absolute inset-x-0 h-[1px] bg-red-500/50 top-1/2 -translate-y-1/2 z-20"></div>
                    <motion.div
                        className="flex gap-4 absolute top-1/2 -translate-y-1/2 h-4 items-end"
                        animate={{ x: `-${progress}%` }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                    >
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 shrink-0 w-8">
                                <div className={`w-[1px] bg-white/40 ${i % 5 === 0 ? 'h-full' : 'h-1/2'}`}></div>
                                {i % 5 === 0 && <span className="text-[8px] font-mono text-white/30">{i * 2}</span>}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* STATUS TEXT */}
                <div className="flex justify-between w-full items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Status</span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={statusText}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-white uppercase tracking-widest font-bold font-mono"
                            >
                                {statusText}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <div className="text-4xl font-black text-white/20 font-mono">
                        {Math.min(100, Math.floor(progress))?.toString().padStart(2, '0')}%
                    </div>
                </div>

            </div>

            {/* CORNER DECORATION */}
            <div className="absolute top-8 left-8 text-[10px] font-mono text-white/20">
                SYS.V.1.0
            </div>
            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/20">
                SECURE CONNECTION
            </div>
        </div>
    )
}
