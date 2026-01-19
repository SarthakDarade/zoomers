import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function NewArrivalsPage({ params }) {
    const { region } = await params

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_new_arrival', true)
        .contains('available_regions', [region])
        .order('created_at', { ascending: false })

    // Provide a fallback if no "New Arrivals" are set manually yet, maybe show latest 4?
    // User requested "Control Whole Products to be shown up", so likely they want explicit control.
    // If empty, it's better to show nothing or a message than unapproved items. 
    // I will show a "No new arrivals" message if empty to encourage them to use the admin panel.

    return (
        <div className="w-full min-h-screen bg-white text-black pt-32 pb-24">

            {/* HEADER */}
            <header className="px-6 md:px-12 max-w-[1800px] mx-auto mb-20 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Season 04</span>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                        New<br />Arrivals
                    </h1>
                </div>
                <p className="max-w-md text-sm text-neutral-500 leading-relaxed text-right md:text-left">
                    The latest curated artifacts of the Zoomers uniform. Manually selected for the current season.
                </p>
            </header>

            {/* CONTROLS */}
            <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-8 flex justify-between items-center border-t border-b border-black/10 py-4 top-20 sticky bg-white/90 backdrop-blur-md z-40">
                <span className="text-xs font-bold uppercase tracking-widest">{products?.length || 0} Items</span>
                <button className="text-xs font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors">
                    Filter +
                </button>
            </div>

            {/* GRID */}
            <div className="px-6 md:px-12 max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
                {products && products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                        No new arrivals curated for this region yet.
                    </div>
                )}
            </div>

        </div>
    )
}
