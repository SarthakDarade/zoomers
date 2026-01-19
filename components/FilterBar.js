'use client'

export default function FilterBar({ activeCategory, setCategory, count }) {
    const categories = ['ALL', 'OUTERWEAR', 'TOPS', 'BOTTOMS', 'ACCESSORIES']

    return (
        <div className="w-full sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* LEFT: CATEGORIES */}
                <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap
                            ${activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>

                {/* RIGHT: META & VIEW */}
                <div className="flex items-center gap-6">
                    <span className="hidden md:block text-[10px] uppercase tracking-widest text-white/30">
                        {count} Objects
                    </span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 border border-white/40 bg-white/40"></div>
                        <div className="w-3 h-3 border border-white/40"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
