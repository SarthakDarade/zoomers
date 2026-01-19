import { supabase } from '@/lib/supabase'
import { BASE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap() {
    // 1. Fetch all products
    const { data: products } = await supabase
        .from('products')
        .select('id, updated_at')

    const productUrls = products?.map((product) => ({
        url: `${BASE_URL}/in/product/${product.id}`, // Default to 'in' or loop regions if needed
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    })) || []

    // 2. Static Routes
    const staticRoutes = [
        '',
        '/in',
        '/in/shop',
        '/in/new-arrivals',
        '/in/collections',
        '/in/about',
        '/in/refund-policy',
        '/in/privacy-policy',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
    }))

    return [...staticRoutes, ...productUrls]
}
