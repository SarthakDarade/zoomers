'use client'
import Image from 'next/image'
import Link from 'next/link'

const COLLECTIONS = [
    {
        id: 'c1',
        title: 'Core Essentials',
        subtitle: 'The Foundation',
        image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=2000&auto=format&fit=crop',
        description: 'Everyday utility built for longevity. The items you reach for first.',
        link: '/shop?tag=core'
    },
    {
        id: 'c2',
        title: 'Technical Outerwear',
        subtitle: 'Weather Systems',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
        description: 'Engineered protection against the elements. GORE-TEX and treated nylons.',
        link: '/shop?tag=outerwear'
    },
    {
        id: 'c3',
        title: 'Archive Footwear',
        subtitle: 'Ground Control',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2000&auto=format&fit=crop',
        description: 'Proprietary sole units and heavy-duty leather construction.',
        link: '/shop?tag=footwear'
    }
]

export default function CollectionsPage() {
    return (
        <div className="w-full min-h-screen bg-black text-white pt-32 pb-24">

            <header className="px-6 md:px-12 max-w-[1800px] mx-auto mb-24 text-center">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                    Collections
                </h1>
                <p className="text-white/50 text-sm max-w-lg mx-auto">
                    Curated assemblies of product designed for specific functionalities and environments.
                </p>
            </header>

            <div className="max-w-[1800px] mx-auto flex flex-col gap-0">
                {COLLECTIONS.map((collection, idx) => (
                    <Link
                        href={collection.link}
                        key={collection.id}
                        className="group relative w-full h-[60vh] md:h-[80vh] overflow-hidden border-t border-white/20"
                    >
                        {/* IMAGE BG */}
                        <Image
                            src={collection.image}
                            alt={collection.title}
                            fill
                            className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000 ease-out grayscale group-hover:grayscale-0"
                        />

                        {/* CONTENT */}
                        <div className="absolute inset-x-6 md:inset-x-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 mix-blend-difference">
                            <span className="text-xs font-bold uppercase tracking-[0.5em] mb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                {collection.subtitle}
                            </span>
                            <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter shadow-black drop-shadow-2xl">
                                {collection.title}
                            </h2>
                            <p className="mt-6 max-w-md text-sm md:text-lg font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                {collection.description}
                            </p>
                            <div className="mt-8 px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-300">
                                Explore Collection
                            </div>
                        </div>

                        {/* NUMBER */}
                        <span className="absolute bottom-6 left-6 md:left-12 text-sm font-mono text-white/50">
                            0{idx + 1}
                        </span>
                    </Link>
                ))}
            </div>

        </div>
    )
}
