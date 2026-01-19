'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'

const TIME_RANGES = [
    { label: '24 Hours', value: '1', days: 1 },
    { label: '3 Days', value: '3', days: 3 },
    { label: '7 Days', value: '7', days: 7 },
    { label: '30 Days', value: '30', days: 30 },
    { label: '3 Months', value: '90', days: 90 },
    { label: '1 Year', value: '365', days: 365 },
    { label: 'Lifetime', value: 'all', days: null },
]

export default function OverviewPage() {
    const { settings, loading: settingsLoading } = useSettings()
    const [selectedRange, setSelectedRange] = useState('7') // Default to 7 days for better visibility

    // State for dashboard data
    const [data, setData] = useState({
        ordersInRange: 0,
        revenueInRange: 0,
        conversionRate: 0.0,
        abandonmentRate: 0.0,
        pendingOrders: [],
        topProduct: null,
        systemHealth: { db: true, api: true, checkout: true }
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData(selectedRange)
    }, [selectedRange])

    const fetchDashboardData = async (rangeValue) => {
        setLoading(true)

        // Calculate start date
        let startDate = null
        if (rangeValue !== 'all') {
            const days = TIME_RANGES.find(r => r.value === rangeValue)?.days || 1
            const date = new Date()
            date.setDate(date.getDate() - days)
            startDate = date.toISOString()
        }

        // 1. Fetch Orders for Pulse (Range constrained)
        let query = supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .order('created_at', { ascending: false })

        if (startDate) {
            query = query.gte('created_at', startDate)
        }

        const { data: orders, error: ordersError } = await query
        if (ordersError) {
            console.error("Dashboard Fetch Error:", ordersError)
            alert("Telemetry Link Failed: " + ordersError.message)
        }

        // 2. Fetch Pending Action Items (Always global, not date constrained)
        const { data: pendingOrders } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .in('status', ['paid', 'processing'])
            .order('created_at', { ascending: true })
            .limit(5)

        // 3. Simple Product Fetch
        const { data: products } = await supabase
            .from('products')
            .select('id, name, price_usd, image_url')
            .limit(1)

        if (!ordersError && orders) {
            // Filter only successful or processing sales for revenue calculation
            const validOrders = orders.filter(o => ['paid', 'shipped', 'delivered', 'processing'].includes(o.status))

            // Explicitly cast to Number to prevent string concatenation
            const totalRev = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

            // Mock Conversion
            const mockSessions = Math.max(orders.length * 40, 100)
            const conversion = (orders.length / mockSessions) * 100

            setData(prev => ({
                ...prev,
                ordersInRange: orders.length,
                revenueInRange: totalRev,
                conversionRate: conversion.toFixed(1),
                pendingOrders: pendingOrders || [],
                topProduct: products?.[0] || null
            }))
        }

        setLoading(false)
    }

    if (settingsLoading) return null

    // Derived States
    const shopMode = settings.config_store?.site_mode || 'live'
    const motionLevel = settings.config_store?.motion_level || 'premium'
    const currencySwitch = settings.config_store?.currency_switch ? 'Enabled' : 'Locked'

    return (
        <div className="space-y-8 pb-20">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">Cockpit</h1>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-white/40">
                        <button
                            onClick={() => fetchDashboardData(selectedRange)}
                            className="hover:text-white transition-colors flex items-center gap-1 group"
                        >
                            <span>Status: Online</span>
                            <span className="group-hover:rotate-180 transition-transform duration-500">↻</span>
                        </button>
                        <span className="text-white/10">|</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* RANGE SELECTOR */}
                <div className="flex bg-white/5 p-1 rounded-lg">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setSelectedRange(range.value)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${selectedRange === range.value
                                ? 'bg-white text-black shadow-lg'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* --- SECTION 1: PULSE (DYNAMIC RANGE) --- */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {loading && <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px] rounded-lg flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-white/40">Updating Telemetry...</div>}

                <PulseCard
                    label="Revenue"
                    value={data.revenueInRange}
                    isCurrency
                    range={TIME_RANGES.find(r => r.value === selectedRange)?.label}
                />
                <PulseCard
                    label="Orders"
                    value={data.ordersInRange}
                    range={TIME_RANGES.find(r => r.value === selectedRange)?.label}
                />
                <PulseCard
                    label="Conversion"
                    value={`${data.conversionRate}%`}
                    sub="Estimate"
                />
                <PulseCard
                    label="System Status"
                    value="100%"
                    sub="Uptime"
                    isGreen
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- SECTION 3: ACTION REQUIRED --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            Action Queue
                            {data.pendingOrders.length > 0 && (
                                <span className="bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded-sm font-black">{data.pendingOrders.length}</span>
                            )}
                        </h3>
                    </div>

                    <div className="space-y-2">
                        {data.pendingOrders.length === 0 ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-lg text-center">
                                <p className="text-white/20 text-xs font-mono uppercase tracking-widest">No Critical Actions Pending</p>
                            </div>
                        ) : (
                            data.pendingOrders.map(order => (
                                <Link href={`/admin/orders?highlight=${order.id}`} key={order.id} className="group block">
                                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded hover:border-white/20 transition-all hover:bg-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                            <div>
                                                <div className="text-xs font-mono text-white/40 mb-0.5">#{order.id.slice(0, 8)}</div>
                                                <div className="text-sm font-bold text-white">Needs Fulfillment</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono text-white">${order.total_amount}</div>
                                            <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-wide">Process Now →</div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* --- SECTION 4: EXPERIENCE --- */}
                <div className="space-y-12">
                    <div className="p-6 border border-white/10 bg-black rounded-xl">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">Global Config</h3>
                        <div className="space-y-6">
                            <StateRow label="Store Mode" value={shopMode} active={shopMode === 'live'} />
                            <StateRow label="Motion Engine" value={motionLevel} />
                            <StateRow label="Currency" value={currencySwitch} />
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <Link href="/admin/settings" className="block text-center text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                Modify Parameters
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PulseCard({ label, value, sub, isCurrency, range, isGreen }) {
    return (
        <div className={`p-6 border border-white/10 rounded-lg bg-[#0A0A0A] transition-colors`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</h3>
                {range && <span className="text-[9px] text-white/20 font-mono uppercase">{range}</span>}
            </div>
            <div className={`text-3xl font-black tracking-tighter mb-2 ${isGreen ? 'text-green-500' : 'text-white'}`}>
                {isCurrency ? (
                    <span><span className="text-lg align-top opacity-50">$</span>{value.toLocaleString()}</span>
                ) : value}
            </div>
            {sub && <div className="text-[9px] font-mono uppercase tracking-wide text-white/30">{sub}</div>}
        </div>
    )
}

function StateRow({ label, value, active }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{label}</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border ${active !== false
                ? 'border-green-500/30 text-green-400 bg-green-500/5'
                : 'border-white/10 text-white/40'
                }`}>
                {value}
            </span>
        </div>
    )
}
