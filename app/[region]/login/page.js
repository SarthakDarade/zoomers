'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    })

    const { signIn, signUp, signInWithGoogle } = useAuth()
    const router = useRouter()

    const handleGoogleSignIn = async () => {
        setError(null)
        setLoading(true)
        try {
            await signInWithGoogle()
            // Redirect is handled by the OAuth provider (Supabase)
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password)
                router.push('/account') // Redirect to dashboard
            } else {
                await signUp(formData.email, formData.password, {
                    full_name: `${formData.firstName} ${formData.lastName}`
                })
                // Supabase by default has email confirmation. 
                // For this demo, we assume auto-confirm OR we show a message.
                // If email confirmation is off, it auto logs in.
                // Let's assume standard flow.
                alert('Account created! You can now log in.')
                setIsLogin(true)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT: VISUAL */}
            <div className="hidden lg:block relative bg-[#0a0a0a]">
                <Image
                    src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop"
                    alt="Editorial"
                    fill
                    className="object-cover opacity-60 mix-blend-screen grayscale"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <blockquote className="max-w-md text-center">
                        <p className="text-white text-3xl font-black uppercase tracking-tighter leading-tight mb-6">
                            "Identity is a construct.<br />Wear it."
                        </p>
                        <cite className="text-white/50 uppercase tracking-widest text-[10px] not-italic">
                            Zoomers Archive Note 001
                        </cite>
                    </blockquote>
                </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="bg-white flex items-center justify-center p-6 md:p-12 lg:p-24">
                <div className="w-full max-w-md flex flex-col pt-20 lg:pt-0">

                    <header className="mb-12">
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                            {isLogin ? 'Welcome Back' : 'Join the Archive'}
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            {isLogin ? 'Log in to access your orders and profile.' : 'Create an account to track orders and checkout faster.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group relative">
                                    <input
                                        name="firstName" type="text" required placeholder=" "
                                        onChange={handleChange}
                                        className="peer w-full py-4 bg-transparent border-b border-black/10 outline-none focus:border-black transition-colors"
                                    />
                                    <label className="absolute left-0 top-4 text-neutral-400 text-xs uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                                        First Name
                                    </label>
                                </div>
                                <div className="group relative">
                                    <input
                                        name="lastName" type="text" required placeholder=" "
                                        onChange={handleChange}
                                        className="peer w-full py-4 bg-transparent border-b border-black/10 outline-none focus:border-black transition-colors"
                                    />
                                    <label className="absolute left-0 top-4 text-neutral-400 text-xs uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                                        Last Name
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="group relative">
                            <input
                                name="email" type="email" required placeholder=" "
                                onChange={handleChange}
                                className="peer w-full py-4 bg-transparent border-b border-black/10 outline-none focus:border-black transition-colors"
                            />
                            <label className="absolute left-0 top-4 text-neutral-400 text-xs uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                                Email Address
                            </label>
                        </div>

                        <div className="group relative">
                            <input
                                name="password" type="password" required placeholder=" "
                                onChange={handleChange}
                                className="peer w-full py-4 bg-transparent border-b border-black/10 outline-none focus:border-black transition-colors"
                            />
                            <label className="absolute left-0 top-4 text-neutral-400 text-xs uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                                Password
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-xs p-4 font-bold uppercase tracking-wide">
                                Error: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-black text-white text-xs uppercase font-bold tracking-widest hover:scale-[1.01] transition-transform mt-8 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-black/10"></div>
                            <span className="flex-shrink mx-4 text-xs text-neutral-400 uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-black/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-5 bg-white border border-black text-black text-xs uppercase font-bold tracking-widest hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
