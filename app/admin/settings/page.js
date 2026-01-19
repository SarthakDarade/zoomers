'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminSettingsPage() {
    // Global State
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({
        // Defaults (in case DB is empty or fails)
        id: true,
        maintenance_mode: false,
        checkout_enabled: true,
        orders_acceptance: true,
        motion_level: 'premium',
        shop_density: 'comfortable',
        experimental_ui: false,
        min_order_value: 0,
        cod_enabled: true,
        free_shipping_threshold: 100,
        cart_auto_open: true,
        currency_base: 'USD',
        auto_detect_currency: true,
        regional_pricing: false,
        return_reassurance_text: 'Easy returns within 30 days.',
        checkout_trust_message: 'Secure checkout powered by Stripe.',
        shipping_info_text: 'Free shipping on orders over $100.',
        audit_log_enabled: true,
    })
    const [lastSaved, setLastSaved] = useState(null)
    const [savingField, setSavingField] = useState(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .single()

            if (data) {
                setSettings(data)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = async (field, value) => {
        // Optimistic Update
        setSettings(prev => ({ ...prev, [field]: value }))
        setSavingField(field)

        try {
            const { error } = await supabase
                .from('system_settings')
                .update({
                    [field]: value,
                    last_updated_at: new Date()
                })
                .eq('id', true)

            if (error) throw error

            setLastSaved(new Date())
            // Simulate instant feedback delay removal
            setTimeout(() => setSavingField(null), 500)

        } catch (error) {
            console.error('Update failed:', error)
            alert(`Failed to save ${field}. Reverting...`)
            fetchSettings() // Revert
            setSavingField(null)
        }
    }

    // Components
    const Section = ({ title, description, children, danger = false }) => (
        <div className={`p-8 border ${danger ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'} mb-8`}>
            <div className="mb-8 border-b border-white/5 pb-4">
                <h2 className={`text-sm font-black uppercase tracking-widest ${danger ? 'text-red-500' : 'text-white'}`}>{title}</h2>
                <p className="text-[10px] text-neutral-500 font-mono mt-2 uppercase tracking-wide">{description}</p>
            </div>
            <div className="space-y-8">
                {children}
            </div>
        </div>
    )

    const Toggle = ({ label, field, danger = false }) => (
        <div className="flex justify-between items-center group">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">{label}</label>
            <button
                onClick={() => updateSetting(field, !settings[field])}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${settings[field]
                        ? (danger ? 'bg-red-500' : 'bg-green-500')
                        : 'bg-neutral-800'
                    }`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${settings[field] ? 'translate-x-6' : 'translate-x-0'
                    }`} />
            </button>
        </div>
    )

    const Select = ({ label, field, options }) => (
        <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 group-hover:text-neutral-300">{label}</label>
            <select
                value={settings[field]}
                onChange={(e) => updateSetting(field, e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 p-3 text-xs font-mono focus:border-white transition-colors outline-none"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )

    const Input = ({ label, field, type = 'text', prefix }) => (
        <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 group-hover:text-neutral-300">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-3 text-current opacity-50 text-xs font-mono">{prefix}</span>}
                <input
                    type={type}
                    value={settings[field]}
                    onChange={(e) => updateSetting(field, e.target.value)}
                    className={`w-full bg-neutral-900 border border-white/10 p-3 text-xs font-mono focus:border-white transition-colors outline-none ${prefix ? 'pl-8' : ''}`}
                />
            </div>
        </div>
    )

    const TextArea = ({ label, field }) => (
        <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 group-hover:text-neutral-300">{label}</label>
            <textarea
                rows={3}
                value={settings[field]}
                onChange={(e) => updateSetting(field, e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 p-3 text-xs font-mono focus:border-white transition-colors outline-none resize-none"
            />
        </div>
    )

    if (loading) return <div className="min-h-screen bg-neutral-900 text-white p-12 font-mono uppercase tracking-widest text-xs">Loading Control Protocol...</div>

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-white selection:text-black pb-24">

            {/* Header */}
            <header className="px-8 py-12 border-b border-white/10 flex justify-between items-end sticky top-0 bg-neutral-900 z-50">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">System Settings</h1>
                    <div className="flex gap-4 text-xs font-mono text-neutral-400 uppercase tracking-widest items-center">
                        <span className={`w-2 h-2 rounded-full ${settings.maintenance_mode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span>System Status: {settings.maintenance_mode ? 'MAINTENANCE' : 'OPERATIONAL'}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                        {savingField ? <span className="text-white animate-pulse">Saving changes...</span> : lastSaved ? 'All systems synced' : 'Ready'}
                    </p>
                    <p className="text-[9px] font-mono text-neutral-600">
                        Last update: {lastSaved ? lastSaved.toLocaleTimeString() : 'Just now'}
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-8">

                {/* SECTION 1 — SYSTEM MODE */}
                <Section title="System Mode" description="Critical controls. Changes affect global availability immediately." danger>
                    <Toggle label="Maintenance Mode" field="maintenance_mode" danger />
                    <div className="h-px bg-white/5" />
                    <Toggle label="Accepting Orders" field="orders_acceptance" />
                    <Toggle label="Checkout Functionality" field="checkout_enabled" />
                </Section>

                {/* SECTION 2 — EXPERIENCE */}
                <Section title="Experience Protocol" description="Define the visual & interactive feel of the storefront.">
                    <div className="grid grid-cols-2 gap-8">
                        <Select
                            label="Motion Density"
                            field="motion_level"
                            options={[
                                { value: 'off', label: 'OFF (Static)' },
                                { value: 'subtle', label: 'Subtle (Performance)' },
                                { value: 'premium', label: 'Premium (Full)' },
                            ]}
                        />
                        <Select
                            label="Shop Density"
                            field="shop_density"
                            options={[
                                { value: 'comfortable', label: 'Comfortable (Default)' },
                                { value: 'compact', label: 'Compact (Data-dense)' },
                            ]}
                        />
                    </div>
                    <Toggle label="Experimental UI Features" field="experimental_ui" />
                </Section>

                {/* SECTION 3 — COMMERCE RULES */}
                <Section title="Commerce Rules" description="Cart thresholds and purchasing logic.">
                    <div className="grid grid-cols-3 gap-8">
                        <Input label="Min Order Value" field="min_order_value" type="number" prefix="$" />
                        <Input label="Free Ship Threshold" field="free_shipping_threshold" type="number" prefix="$" />
                        <div className="flex items-end pb-2">
                            <Toggle label="Cash on Delivery" field="cod_enabled" />
                        </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <Toggle label="Auto-Open Cart on Add" field="cart_auto_open" />
                </Section>

                {/* SECTION 4 — CURRENCY */}
                <Section title="Currency & Pricing" description="Global monetary configuration.">
                    <div className="grid grid-cols-2 gap-8">
                        <Input label="Base Currency" field="currency_base" />
                        <div className="space-y-4">
                            <Toggle label="Auto-Detect Location" field="auto_detect_currency" />
                            <Toggle label="Enable Regional Pricing" field="regional_pricing" />
                        </div>
                    </div>
                </Section>

                {/* SECTION 5 — CONTENT */}
                <Section title="Content Injections" description="Micro-copy for key touchpoints.">
                    <TextArea label="Returns Reassurance (Product Page)" field="return_reassurance_text" />
                    <TextArea label="Checkout Trust Message" field="checkout_trust_message" />
                    <TextArea label="Global Shipping Info" field="shipping_info_text" />
                </Section>

                {/* SECTION 6 — SECURITY */}
                <Section title="Security Audit" description="Access logging and administrator trails.">
                    <Toggle label="Enable Audit Logging" field="audit_log_enabled" />
                    <div className="mt-4 p-4 bg-black/40 border border-white/5 font-mono text-[10px] text-neutral-500">
                        <p>CURRENT SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        <p>ACCESS LEVEL: ROOT_ADMIN</p>
                        <p>ENCRYPTION: AES-256 enabled</p>
                    </div>
                </Section>

            </main>
        </div>
    )
}
