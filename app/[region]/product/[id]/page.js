import { supabase } from '@/lib/supabase'
import Smoother from '@/components/Smoother'
import ProductDetail from '@/components/ProductDetail'
import { notFound } from 'next/navigation'
import { generateProductSchema, generateBreadcrumbSchema, BASE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
    const { region, id } = await params

    // Fetch minimal data for metadata
    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url')
        .eq('id', id)
        .single()

    if (!product) return {
        title: 'Product Not Found',
        description: 'The requested artifact could not be located.'
    }

    return {
        title: product.name,
        description: product.description || `Buy ${product.name} at Zoomers Archive.`,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [
                {
                    url: product.image_url,
                    width: 800,
                    height: 1000,
                    alt: product.name
                }
            ],
            url: `${BASE_URL}/${region}/product/${id}`,
            type: 'product'
        },
        alternates: {
            canonical: `${BASE_URL}/${region}/product/${id}`
        }
    }
}

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

    const jsonLd = generateProductSchema(product, region)
    const breadcrumbLd = generateBreadcrumbSchema([
        { name: "Home", url: `/${region}` },
        { name: "Shop", url: `/${region}/shop` },
        { name: product.name, url: `/${region}/product/${id}` }
    ])

    return (
        <Smoother>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ProductDetail product={product} relatedProducts={relatedProducts || []} />
        </Smoother>
    )
}
