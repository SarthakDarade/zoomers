'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

import { useCurrency } from '@/context/CurrencyContext'

export default function ProductCard({ product }) {
    const { addToCart } = useCart()
    const { getProductPrice, formatPrice, region } = useCurrency()

    const price = getProductPrice(product)


    const handleQuickAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product, 'L')
    }

    return (
        <Link href={`/${region}/product/${product.id}`} className="group w-full flex flex-col gap-4 cursor-pointer">
            {/* IMAGE CONTAINER */}
            <div className="relative w-full aspect-[3/4] bg-[#f4f4f5] overflow-hidden">
                <div className="absolute top-2 left-2 z-20">
                    {product.id % 3 === 0 && <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider">New Season</span>}
                </div>

                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover mix-blend-multiply transition-transform ease-premium group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* HOVER QUICK ACTION (CSS ONLY) */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform ease-premium flex justify-center">
                    <button
                        onClick={handleQuickAdd}
                        className="w-full bg-white text-black py-3 text-xs uppercase font-bold tracking-widest hover:bg-black hover:text-white transition-colors shadow-lg border border-black"
                    >
                        Quick Add +
                    </button>
                </div>
            </div>

            {/* INFO */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-black group-hover:underline decoration-1 underline-offset-4">
                        {product.name}
                    </h3>
                    <span className="text-xs font-bold font-mono text-black">
                        {formatPrice(price)}
                    </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                    {product.function || 'Ready-to-wear'}
                </p>
            </div>
        </Link>
    )
}
