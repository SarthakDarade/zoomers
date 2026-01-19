'use client'
import { useState, useEffect } from 'react'

export default function EmailSettings() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        host: '',
        port: 587,
        username: '',
        password: '',
        from_email: '',
        from_name: 'Zoomers Support',
        secure: true
    })
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetch('/api/admin/smtp')
            .then(res => res.json())
            .then(res => {
                if (res.data) {
                    setSettings(prev => ({ ...prev, ...res.data }))
                }
            })
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('/api/admin/smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setMessage('Settings Saved Successfully')
            // Don't clear password here to allow testing immediately? 
            // Actually API returns it masked.
        } catch (error) {
            setMessage('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl text-black">
            <h1 className="text-2xl font-bold mb-6">SMTP Email Settings</h1>

            {message && <div className="mb-4 p-4 bg-gray-100 border border-gray-300 text-sm font-mono">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">SMTP Host</label>
                        <input
                            type="text"
                            name="host"
                            value={settings.host || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            placeholder="smtp.example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">SMTP Port</label>
                        <input
                            type="number"
                            name="port"
                            value={settings.port || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            placeholder="587"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={settings.username || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={settings.password || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            placeholder={settings.id ? '********' : 'Start typing to set'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">From Name</label>
                        <input
                            type="text"
                            name="from_name"
                            value={settings.from_name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">From Email</label>
                        <input
                            type="email"
                            name="from_email"
                            value={settings.from_email || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-black outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                        <input
                            type="checkbox"
                            name="secure"
                            checked={settings.secure || false}
                            onChange={handleChange}
                        />
                        Secure (TLS/SSL)
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>

            </form>
        </div>
    )
}
