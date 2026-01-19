'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'

import { useCurrency } from '@/context/CurrencyContext'

export default function ProductItem({ product, index }) {
    const el = useRef(null)
    const imageRef = useRef(null)
    const infoRef = useRef(null)
    const { getProductPrice, formatPrice } = useCurrency()

    useEffect(() => {
        // ScrollReveal
        gsap.fromTo(el.current,
            { opacity: 0, y: 100 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el.current,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        )
    }, [])

    const onEnter = () => {
        // Reveal info
        gsap.to(infoRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        gsap.to(imageRef.current, { scale: 1.03, duration: 0.8, ease: 'power2.out' })
        gsap.to(el.current, { zIndex: 10 })
    }

    const onLeave = () => {
        gsap.to(infoRef.current, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' })
        gsap.to(imageRef.current, { scale: 1, duration: 0.8, ease: 'power2.out' })
        gsap.to(el.current, { zIndex: 1, delay: 0.4 })
    }

    // Asymmetry logic
    // Index 0: Center, large
    // Index 1: Left, smaller
    // Index 2: Right, medium

    let layoutClass = 'items-center' // default
    let widthClass = 'w-full md:w-[60vw]'
    let aspectClass = 'aspect-[3/4]'

    if (index % 3 === 0) {
        layoutClass = 'items-center'
        widthClass = 'w-full md:w-[50vw]'
    } else if (index % 3 === 1) {
        layoutClass = 'items-start pl-0 md:pl-[10vw]'
        widthClass = 'w-full md:w-[35vw]'
        aspectClass = 'aspect-[4/5]'
    } else {
        layoutClass = 'items-end pr-0 md:pr-[10vw]'
        widthClass = 'w-full md:w-[40vw]'
        aspectClass = 'aspect-[3/5]'
    }

    return (
        <div
            ref={el}
            className={`w-full min-h-[90vh] flex flex-col justify-center px-4 py-12 ${layoutClass} relative z-1`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <div className={`relative ${widthClass} ${aspectClass} overflow-hidden bg-[#111] cursor-pointer`}>
                <Image
                    ref={imageRef}
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover opacity-70 transition-all duration-700 grayscale hover:grayscale-0"
                />

                {/* Overlay Info */}
                <div
                    ref={infoRef}
                    className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 md:p-12 opacity-0 translate-y-4"
                >
                    <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4 text-white/60 border-l border-white/20 pl-4">
                        {product.function || 'Unknown Function'}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-2 leading-[0.8]">
                        {product.name}
                    </h2>

                    <div className="flex items-center justify-between mt-8 border-t border-white/20 pt-6">
                        <span className="text-lg md:text-2xl font-mono text-white/90 tracking-tighter mix-blend-difference">
                            {formatPrice(getProductPrice(product))}
                        </span>
                        <div className="flex items-center gap-2 group/btn">
                            <span className="text-[10px] uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">Access Object</span>
                            <span className="text-lg opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
