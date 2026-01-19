'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'

const CurrencyContext = createContext()

const REGION_TO_CURRENCY = {
    'in': 'INR',
    'us': 'USD',
    'gb': 'GBP',
    'eu': 'EUR'
}

const CURRENCY_TO_REGION = {
    'INR': 'in',
    'USD': 'us',
    'GBP': 'gb',
    'EUR': 'eu'
}

export function CurrencyProvider({ children }) {
    const params = useParams()
    const pathname = usePathname()
    const router = useRouter()

    // Derive currency from URL region param, default to INR if missing (e.g. admin)
    const region = params?.region || 'in'
    const currency = REGION_TO_CURRENCY[region] || 'INR'

    const currencies = {
        INR: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'India (INR)' },
        USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'United States (USD)' },
        GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'United Kingdom (GBP)' },
        EUR: { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'Europe (EUR)' }
    }

    const switchRegion = (targetCurrencyCode) => {
        const targetRegion = CURRENCY_TO_REGION[targetCurrencyCode]
        if (!targetRegion) return

        // Replace the current region in the path with the new one
        // Path format: /region/rest-of-path
        const segments = pathname.split('/')
        // segments[0] is empty, segments[1] is region
        if (Object.keys(REGION_TO_CURRENCY).includes(segments[1])) {
            segments[1] = targetRegion
            const newPath = segments.join('/')
            router.push(newPath)
        } else {
            // Fallback if we are in a non-region route (shouldn't happen for shop pages)
            router.push(`/${targetRegion}`)
        }
    }

    // Helper to extract the correct price value from a product object
    const getProductPrice = (product) => {
        if (!product) return 0

        switch (currency) {
            case 'USD': return product.price_usd || 0
            case 'GBP': return product.price_gbp || 0
            case 'EUR': return product.price_eur || 0
            case 'INR': return product.price_inr || product.price || 0
            default: return product.price_inr || product.price || 0
        }
    }

    const formatPrice = (amount) => {
        const { locale, code } = currencies[currency] || currencies['INR']

        const options = {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }

        if (amount % 1 !== 0) {
            options.minimumFractionDigits = 2
            options.maximumFractionDigits = 2
        }

        return new Intl.NumberFormat(locale, options).format(amount)
    }

    return (
        <CurrencyContext.Provider value={{
            currency,
            region,
            setCurrency: switchRegion, // Keep name for compatibility but it switches region
            getProductPrice,
            formatPrice,
            currencyDetails: currencies[currency],
            allCurrencies: currencies,
            isLoading: false
        }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => useContext(CurrencyContext)
