import { BASE_URL } from '@/lib/seo'

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/_next/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
