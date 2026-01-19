export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Legal Framework</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Privacy<br />Policy
                    </h1>
                </header>

                <div className="font-mono text-sm leading-relaxed space-y-8 text-black/80">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">01. Data Collection</h3>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or interact with our services. This includes contact details, payment information (processed securely by third-party protocols), and shipping data.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">02. Usage Protocol</h3>
                        <p>
                            Your data is used solely to facilitate transactions, improve our digital artifacts, and communicate pertinent updates. We do not sell or lease your personal signal to external non-affiliated entities.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">03. Security Measures</h3>
                        <p>
                            We employ standard global encryption (SSL) and secure processing hubs (Stripe/Razorpay) to ensure your data remains inviolate during transmission and storage.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">04. Cookies & Tracking</h3>
                        <p>
                            Minimal tracking pixels are used to enhance user experience and session continuity. You may disable these via your browser interface, though functionality may be compromised.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
