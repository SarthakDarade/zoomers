import { supabase } from '@/lib/supabase'
import Smoother from '@/components/Smoother'
import ProductDetail from '@/components/ProductDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// This logic allows direct access to individual products
export default async function ProductPage({ params }) {
    const { region, id } = await params

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    const { data: relatedProducts } = await supabase
        .from('products')
        .select('*')
        .neq('id', id)
        .contains('available_regions', [region]) // Also filter related
        .limit(3)

    if (error || !product) {
        notFound()
    }

    // Check Region Availability
    if (product.available_regions && !product.available_regions.includes(region)) {
        notFound()
    }

    return (
        <Smoother>
            <ProductDetail product={product} relatedProducts={relatedProducts || []} />
        </Smoother>
    )
}
