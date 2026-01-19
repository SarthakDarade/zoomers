import { NextResponse } from 'next/server'

const regions = ['in', 'us', 'gb', 'eu']
const defaultRegion = 'in'

export function middleware(request) {
    const pathname = request.nextUrl.pathname

    // Exclusions:
    // - /api/* (API routes)
    // - /admin/* (Admin panel)
    // - /_next/* (Next.js internals)
    // - /static/* (Static files)
    // - /favicon.ico, /icon.png, etc.
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') || // Files with extensions
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml'
    ) {
        return
    }

    // Check if pathname already has a region
    const pathnameIsMissingRegion = regions.every(
        (target) => !pathname.startsWith(`/${target}/`) && pathname !== `/${target}`
    )

    if (pathnameIsMissingRegion) {
        // Redirect to default region (India)
        // In a future version, we could use geo-ip headers here to redirect to us/gb/eu
        const url = request.nextUrl.clone()
        url.pathname = `/${defaultRegion}${pathname === '/' ? '' : pathname}`
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|api|favicon.ico).*)',
    ],
}
