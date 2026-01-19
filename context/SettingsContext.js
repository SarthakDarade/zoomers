'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const SettingsContext = createContext()

export function useSettings() {
    return useContext(SettingsContext)
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        config_store: {},
        config_ui: {}
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Initial Fetch
        fetchSettings()

        // Realtime Subscription
        const channel = supabase
            .channel('public:system_settings')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, (payload) => {
                // Instantly apply changes
                setSettings(prev => ({
                    ...prev,
                    [payload.new.key]: payload.new.value
                }))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase.from('system_settings').select('*')
        if (data) {
            const map = {}
            data.forEach(row => { map[row.key] = row.value })
            setSettings(map)
        }
        setLoading(false)
    }

    // Convenience Getters
    const getStoreConfig = (key, fallback) => settings.config_store?.[key] ?? fallback
    const getUIConfig = (key, fallback) => settings.config_ui?.[key] ?? fallback

    const value = {
        settings,
        loading,
        getStoreConfig,
        getUIConfig
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}
