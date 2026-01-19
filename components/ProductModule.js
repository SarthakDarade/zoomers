'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'

export default function ProductModule({ product, index, isSimple = false }) {
    const containerRef = useRef(null)
    const imageWrapperRef = useRef(null)
    const imageRef = useRef(null)
    const metaRef = useRef(null)
    const lineRef = useRef(null)
    const detailsRef = useRef(null)

    // Layout Logic overwritten if "isSimple" (Grid Mode)
    // In grid mode, we fill the parent provided by the virtual row
    const variant = index % 4

    let containerClasses = isSimple
        ? "w-full h-full relative group overflow-hidden"
        : "w-full min-h-[80vh] flex px-6 md:px-24 py-24 relative"

    let wrapperClasses = isSimple
        ? "relative w-full h-full grayscale"
        : "relative grayscale transition-all duration-1000 ease-[0.19,1,0.22,1]"

    if (!isSimple) {
        if (variant === 0) {
            containerClasses += " justify-center items-center"
            wrapperClasses += " w-full max-w-[50vw] aspect-[3/4]"
        } else if (variant === 1) {
            containerClasses += " justify-start items-start pt-[30vh]"
            wrapperClasses += " w-full max-w-[30vw] aspect-[4/5]"
        } else if (variant === 2) {
            containerClasses += " justify-end items-center"
            wrapperClasses += " w-full max-w-[38vw] aspect-[3/4]"
        } else {
            containerClasses += " justify-center items-end pb-[20vh]"
            wrapperClasses += " w-full max-w-[40vw] aspect-[1/1]"
        }
    }

    useEffect(() => {
        if (isSimple) return // Skip heavy ScrollTrigger for virtual items

        const ctx = gsap.context(() => {
            // 1. ENTRY ANIMATION (Scroll-driven)
            // The object rises from the void. Weighted. Slow.
            gsap.fromTo(containerRef.current,
                { y: 120, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.8,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                        end: "top 40%",
                        scrub: 1 // Slight scrub for weight
                    }
                }
            )

            gsap.to(imageRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: "15%", // Parallax effect
                ease: "none"
            })

        }, containerRef)

        return () => ctx.revert()
    }, [isSimple])

    const handleMouseEnter = () => {
        // 2. INTERACTION STATE (The Reveal)
        // Custom easing: cubic-bezier(0.19, 1, 0.22, 1) -> exponential out feeling
        const easeCustom = "cubic-bezier(0.19, 1, 0.22, 1)"

        // Image: De-grayscale, slight lift
        gsap.to(imageWrapperRef.current, {
            filter: "grayscale(0%)",
            scale: 1.05,
            duration: 1.0,
            ease: easeCustom
        })

        // Meta: Name & Function reveal
        if (metaRef.current) gsap.to(metaRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: easeCustom
        })

        // Line: Draws out
        if (lineRef.current) gsap.to(lineRef.current, {
            scaleX: 1,
            opacity: 0.5,
            duration: 0.8,
            ease: easeCustom
        })

        // Details: Price & Action reveal
        if (detailsRef.current) gsap.to(detailsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.1,
            ease: easeCustom
        })
    }

    const handleMouseLeave = () => {
        const easeReturn = "power3.out"

        gsap.to(imageWrapperRef.current, {
            filter: "grayscale(100%)",
            scale: 1,
            duration: 0.8,
            ease: easeReturn
        })

        if (metaRef.current) gsap.to(metaRef.current, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            ease: easeReturn
        })

        if (lineRef.current) gsap.to(lineRef.current, {
            scaleX: 0,
            opacity: 0,
            duration: 0.6,
            ease: easeReturn
        })

        if (detailsRef.current) gsap.to(detailsRef.current, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            ease: easeReturn
        })
    }

    return (
        <div
            ref={containerRef}
            className={containerClasses}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 
        THE OBJECT 
        Simple. Massive. Silent.
      */}
            <div
                ref={imageWrapperRef}
                className={`${wrapperClasses} overflow-hidden cursor-none bg-[#111]`}
            >
                <Image
                    ref={imageRef}
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover scale-110"
                    loading={isSimple ? "lazy" : "eager"}
                />

                {/* NOISE/GRAIN OVERLAY for texture feeling */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* 
        DATA LAYER
        For Simple mode, we overlay it absolutely over the image to save space and keep it tight.
      */}
            <div className={`
         pointer-events-none z-20 flex flex-col 
         ${isSimple ? 'absolute inset-0 p-6 justify-end items-start bg-gradient-to-t from-black/80 to-transparent' :
                    `absolute ${variant % 2 === 0 ? 'left-1/2 -translate-x-1/2 bottom-12 items-center text-center' :
                        variant === 1 ? 'left-24 bottom-auto top-1/2 -translate-y-1/2 items-start' : 'right-24 bottom-1/2 translate-y-1/2 items-end text-right'}`
                }
      `}>
                {/* META: Name & Function */}
                <div ref={metaRef} className="opacity-0 translate-y-4">
                    <h2 className={`${isSimple ? 'text-2xl' : 'text-[4vw] md:text-[5vw]'} leading-[0.85] font-bold uppercase tracking-tighter text-white mix-blend-exclusion`}>
                        {product.name}
                    </h2>
                    <p className="text-[10px] md:text-sm uppercase tracking-[0.2em] text-white/60 mt-2 font-mono mix-blend-difference">
                        {product.function}
                    </p>
                </div>

                {/* DECO LINE */}
                <div
                    ref={lineRef}
                    className={`h-[1px] bg-white mt-4 mb-4 opacity-0 scale-x-0 origin-left ${isSimple ? 'w-full' : 'w-[100px]'}`}
                />

                {/* DETAILS: Price & Action */}
                <div ref={detailsRef} className={`opacity-0 translate-y-3 flex flex-col gap-1 ${isSimple ? 'items-start' : 'items-inherit'}`}>
                    <span className="text-xl font-light tracking-wide text-white mix-blend-difference">
                        ${product.price}
                    </span>
                    {!isSimple && (
                        <span className="text-[10px] bg-white text-black px-3 py-1 uppercase tracking-widest font-bold mt-2">
                            Explore Object
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
