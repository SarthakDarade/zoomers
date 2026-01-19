'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCurrency } from '@/context/CurrencyContext'

export default function OrderSuccess({ order }) {
    const { region } = useCurrency()

    const formatOrderPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-[#f4f4f5] text-black font-sans selection:bg-black selection:text-white pt-32 pb-20">

            <div className="max-w-4xl mx-auto px-6">

                {/* HEADER STATUS */}
                <div className="flex flex-col items-center text-center mb-12 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-6"></div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                        Acquisition Confirmed
                    </h1>
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                        Reference ID: <span className="text-black border-b border-black select-all">{order.id}</span>
                    </p>
                </div>

                {/* MAIN MANIFEST CARD */}
                <div className="bg-white border border-neutral-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-1000 fade-in fill-mode-backwards delay-200">

                    {/* TICKET HEADER */}
                    <div className="bg-black text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 block mb-1">Dispatching To</span>
                            <div className="text-lg font-bold leading-tight">
                                {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                            </div>
                            <div className="text-xs font-mono opacity-80 mt-1">
                                {order.shipping_address?.city}, {order.shipping_address?.country}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 block mb-1">Status</span>
                            <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Processing</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-100">

                        {/* ITEMS COLUMN */}
                        <div className="md:col-span-8 p-6 md:p-10">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-8 border-b border-neutral-100 pb-4">
                                Manifest Items ({order.items.length})
                            </h2>
                            <div className="space-y-8">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="relative w-20 aspect-[3/4] bg-neutral-100 shrink-0 overflow-hidden border border-neutral-100">
                                            {item.products?.image_url ? (
                                                <Image
                                                    src={item.products.image_url}
                                                    alt="Artifact"
                                                    fill
                                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400 text-xs">N/A</div>
                                            )}
                                        </div>
                                        <div className="flex-1 py-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-sm font-bold uppercase tracking-tight">{item.products?.name || 'Unknown Artifact'}</h3>
                                                    <span className="text-sm font-mono font-medium">
                                                        {formatOrderPrice(item.price)}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                                                    Size: {item.size} <span className="mx-2">/</span> Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-[9px] uppercase tracking-widest text-[#cd2b2b]">
                                                Allocated from Archive
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SUMMARY COLUMN */}
                        <div className="md:col-span-4 bg-neutral-50/50 p-6 md:p-10 flex flex-col justify-between">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-8 border-b border-neutral-200 pb-4">
                                    Financial Protocol
                                </h2>
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Payment ID</span>
                                        <span className="text-black">#{order.gateway_payment_id?.slice(-8) || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Gateway</span>
                                        <span className="uppercase text-black">{order.payment_gateway}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Currency</span>
                                        <span className="text-black">{order.currency}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <div className="flex justify-between items-end border-t border-black pb-2 pt-6">
                                    <span className="text-xs font-bold uppercase tracking-widest">Total Authorized</span>
                                    <span className="text-2xl font-black tracking-tighter">
                                        {formatOrderPrice(order.total_amount)}
                                    </span>
                                </div>
                                <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-relaxed mt-4">
                                    A confirmation email has been transmitted to {order.user_email}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex justify-center mt-12 gap-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-forwards">
                    <Link
                        href={`/${region}/shop`}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:text-neutral-500 transition-colors"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Return to Shop
                    </Link>
                    <span className="text-neutral-300">|</span>
                    <Link
                        href={`/${region}/new-arrivals`}
                        className="text-xs font-bold uppercase tracking-[0.2em] hover:text-[#cd2b2b] transition-colors"
                    >
                        View New Arrivals
                    </Link>
                </div>

                <div className="text-center mt-24 mb-12">
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                        Zoomers Archive System™ — London
                    </p>
                </div>

            </div>
        </div>
    )
}
