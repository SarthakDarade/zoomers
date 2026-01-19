'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'

export default function ProductDetail({ product, relatedProducts = [] }) {
    const [selectedSize, setSelectedSize] = useState(null)
    const { addToCart } = useCart()
    const { getProductPrice, formatPrice, region } = useCurrency()
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
    const [viewers, setViewers] = useState(12)

    const price = getProductPrice(product)


    // Simulation of "Live Viewers" for Social Proof
    useEffect(() => {
        const interval = setInterval(() => {
            setViewers(prev => Math.max(8, prev + Math.floor(Math.random() * 3) - 1))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const sizes = ['S', 'M', 'L', 'XL']

    const handleAddToCart = () => {
        addToCart(product, selectedSize)
    }

    return (
        <div className="w-full min-h-screen bg-white text-black pt-24 pb-40 relative">

            {/* LUXURY GRID: 12 COLUMNS */}
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative">

                {/* LEFT: GALLERY (COLS 1-8) - SCROLLABLE */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* PRIMARY IMAGE */}
                    <div className="relative w-full aspect-[4/5] bg-[#f4f4f5] overflow-hidden">
                        <div className="absolute top-6 left-6 z-20 flex gap-4">
                            <span className="bg-[#cd2b2b] text-white text-[10px] font-bold uppercase px-3 py-1.5 tracking-widest">
                                Archive Edition
                            </span>
                            <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold uppercase px-3 py-1.5 tracking-widest border border-black/5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                {viewers} Live in Atelier
                            </span>
                        </div>
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-1000 ease-out hover:scale-[1.02] cursor-zoom-in"
                            priority
                        />
                    </div>

                    {/* SECONDARY IMAGES (MOCKED) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative w-full aspect-[4/5] bg-[#f4f4f5] overflow-hidden">
                            <Image
                                src={product.image_url} // Re-using for demo
                                alt="Detail 1"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="relative w-full aspect-[4/5] bg-[#f4f4f5] overflow-hidden">
                            <Image
                                src={product.image_url_2 || product.image_url}
                                alt="Detail 2"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: SHOPPING MODULE (COLS 9-12) - STICKY */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-32 flex flex-col h-auto min-h-[50vh]">

                        {/* BREADCRUMBS */}
                        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-6">
                            <Link href={`/${region}`} className="hover:text-black transition-colors">Home</Link> /
                            <Link href={`/${region}/shop`} className="hover:text-black transition-colors">Shop</Link> /
                            <span className="text-black">Season 04</span>
                        </div>

                        {/* TITLE BLOCK */}
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                                {product.name}
                            </h1>
                            <div className="flex justify-between items-center border-b border-black/10 pb-6">
                                <span className="text-2xl font-mono text-black font-bold">
                                    {formatPrice(price)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${(product.stock_quantity || 0) <= 0 ? 'bg-red-600' :
                                        (product.stock_quantity || 0) <= 5 ? 'bg-red-500 animate-pulse' :
                                            (product.stock_quantity || 0) <= 25 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                        }`}></span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${(product.stock_quantity || 0) <= 5 ? 'text-red-600' : 'text-black'
                                        }`}>
                                        {(product.stock_quantity || 0) <= 0 ? 'Archived // Sold Out' :
                                            (product.stock_quantity || 0) <= 5 ? `Critical: ${product.stock_quantity} Remaining` :
                                                (product.stock_quantity || 0) <= 25 ? 'Limited Quantities' :
                                                    'In Stock // Global Dispatch'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* SELECTOR */}
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Size</span>
                                <button
                                    onClick={() => setIsSizeGuideOpen(true)}
                                    className="text-[10px] underline uppercase tracking-widest text-black hover:opacity-60 transition-opacity"
                                >
                                    Size Guide
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={(product.stock_quantity || 0) <= 0}
                                        className={`h-12 border flex items-center justify-center text-sm font-bold transition-all duration-300 uppercase
                                         ${selectedSize === size
                                                ? 'bg-black text-white border-black'
                                                : (product.stock_quantity || 0) <= 0
                                                    ? 'bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed decoration-slice'
                                                    : 'bg-white text-black border-neutral-200 hover:border-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {(!selectedSize && (product.stock_quantity || 0) > 0) && <p className="text-[10px] text-red-500 mt-2 h-4">{/* Error placeholder */}</p>}
                        </div>

                        {/* MAIN ACTION */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize || (product.stock_quantity || 0) <= 0}
                            className={`w-full py-6 uppercase font-black text-sm tracking-[0.2em] transition-all duration-300 mb-6
                                ${(product.stock_quantity || 0) <= 0
                                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    : selectedSize
                                        ? 'bg-[#cd2b2b] text-white hover:bg-black shadow-xl hover:shadow-2xl'
                                        : 'bg-black text-white cursor-pointer hover:bg-neutral-800'}`}
                        >
                            {(product.stock_quantity || 0) <= 0
                                ? 'Sold Out'
                                : selectedSize
                                    ? `Add to Bag — ${formatPrice(price)}`
                                    : 'Select Size'}
                        </button>

                        {/* MICRO INFO */}
                        <div className="text-[11px] leading-relaxed text-neutral-500 font-medium mb-12">
                            <p className="mb-4">{product.function || 'Engineered in London. Constructed for the modern uniform.'}</p>
                            <ul className="flex flex-col gap-2 border-l-2 border-black/10 pl-4 py-1">
                                <li>Complimentary Global Delivery</li>
                                <li>14-Day Returns Policy</li>
                                <li>Secure Encrpyted Checkout</li>
                            </ul>
                        </div>

                        {/* DETAILS ACCORDION - SIMPLIFIED */}
                        <div className="border-t border-black/10">
                            <details className="group">
                                <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-4 text-xs uppercase tracking-widest">
                                    Details & Specs
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-neutral-600 text-sm pb-4">
                                    <p>Heavy-weight cotton blend. Reinforced stitching. Fits true to size.</p>
                                </div>
                            </details>
                            <details className="group border-t border-black/10">
                                <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-4 text-xs uppercase tracking-widest">
                                    Shipping
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-neutral-600 text-sm pb-4">
                                    <p>Dispatched within 24 hours via DHL Express. Import duties included.</p>
                                </div>
                            </details>
                        </div>

                    </div>
                </div>

            </div>

            {/* IMAGE BREAK */}
            <div className="w-full h-screen relative mt-32 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url('${product.image_url}')` }}>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h2 className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter opacity-80 mix-blend-overlay">
                        Zoomers
                    </h2>
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-32 border-t border-black/10">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 text-center">Archive Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProducts.map(related => (
                            <Link key={related.id} href={`/${region}/product/${related.id}`} className="group block">
                                <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden mb-6">
                                    <Image
                                        src={related.image_url}
                                        alt={related.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-bold uppercase tracking-tighter mb-1 leading-none">{related.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-neutral-500">{related.function || 'Standard Issue'}</p>
                                    </div>
                                    <span className="font-mono text-sm font-bold">{formatPrice(getProductPrice(related))}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* SIZE GUIDE MODAL */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSizeGuideOpen(false)}
                    ></div>
                    <div className="relative bg-white w-full max-w-2xl p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsSizeGuideOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-neutral-100 transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Size Guide</h3>
                        <p className="text-sm text-neutral-500 mb-8">Measurements are in inches. Fits true to size.</p>

                        <table className="w-full text-sm font-mono border-collapse mb-8">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="text-left py-4 uppercase tracking-widest">Size</th>
                                    <th className="text-left py-4 uppercase tracking-widest">Chest</th>
                                    <th className="text-left py-4 uppercase tracking-widest">Length</th>
                                    <th className="text-left py-4 uppercase tracking-widest">Shoulder</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-neutral-600">
                                <tr>
                                    <td className="py-4 font-bold text-black">S</td>
                                    <td className="py-4">20"</td>
                                    <td className="py-4">27"</td>
                                    <td className="py-4">17"</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-bold text-black">M</td>
                                    <td className="py-4">22"</td>
                                    <td className="py-4">28"</td>
                                    <td className="py-4">18"</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-bold text-black">L</td>
                                    <td className="py-4">24"</td>
                                    <td className="py-4">29"</td>
                                    <td className="py-4">19"</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-bold text-black">XL</td>
                                    <td className="py-4">26"</td>
                                    <td className="py-4">30"</td>
                                    <td className="py-4">20"</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="bg-neutral-100 p-4 text-xs text-neutral-500 uppercase tracking-wide border-l-2 border-black">
                            Pro Tip: For a contemporary oversized silhouette, we recommend sizing up.
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
