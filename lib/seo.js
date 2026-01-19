export const COMPANY_NAME = "Zoomers Archive System";
export const BASE_URL = "https://zoomers.shop"; // Replace with actual domain
export const DEFAULT_REGION = "in";

export function generateProductSchema(product, region) {
    if (!product) return null;

    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.image_url, product.image_url_2].filter(Boolean),
        "description": product.description || "Archive functionality tailored for the modern operator.",
        "sku": `ZAS-${product.id}`,
        "brand": {
            "@type": "Brand",
            "name": "Zoomers"
        },
        "offers": {
            "@type": "Offer",
            "url": `${BASE_URL}/${region}/product/${product.id}`,
            "priceCurrency": "USD", // Should ideally be dynamic based on region
            "price": product.price_usd || product.price,
            "availability": (product.stock_quantity > 0)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };
}

export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": COMPANY_NAME,
        "url": BASE_URL,
        "logo": `${BASE_URL}/logo.png`, // Needs actual asset
        "sameAs": [
            "https://www.instagram.com/zoomersoff"
        ]
    };
}

export function generateBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${BASE_URL}${item.url}`
        }))
    };
}
