import { supabase } from '@/lib/supabase'
import ShopInterface from '@/components/ShopInterface'

export const dynamic = 'force-dynamic'

export default async function ShopPage({ params }) {
    const { region } = await params

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .contains('available_regions', [region])
        .order('created_at', { ascending: false })

    return (
        <main className="w-full min-h-screen bg-[#050505] text-[#f4f4f5]">
            <ShopInterface products={products || []} />
        </main>
    )
}
