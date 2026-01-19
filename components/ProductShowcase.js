'use client'
import ProductModule from './ProductModule'

export default function ProductShowcase({ products }) {
    return (
        <section className="w-full relative z-20 pb-40 bg-[#050505]">
            <div className="w-full flex flex-col gap-0 w-full overflow-hidden">
                {products.map((p, i) => (
                    <ProductModule key={p.id} product={p} index={i} />
                ))}
            </div>

            <div className="w-full py-40 flex justify-center border-t border-white/5 mx-auto max-w-[90vw]">
                <span className="text-xs uppercase tracking-[0.5em] opacity-30">End of Archive</span>
            </div>
        </section>
    )
}
