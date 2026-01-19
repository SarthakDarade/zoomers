export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Legal Framework</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Terms of<br />Service
                    </h1>
                </header>

                <div className="font-mono text-sm leading-relaxed space-y-8 text-black/80">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">01. Acceptance of Protocol</h3>
                        <p>
                            By accessing Zoomers Archive System, you agree to be bound by these Terms. If you disagree with any part of the protocol, you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">02. Digital & Physical Artifacts</h3>
                        <p>
                            Products described are subject to availability. We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction. We endeavor to display as accurately as possible the colors and images of our products.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">03. Purchasing Protocol</h3>
                        <p>
                            You agree to provide current, complete, and accurate purchase and account information. You agree to promptly update your account and other information, including your email address and credit card numbers/expiration dates, so that we can complete your transactions.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">04. Governing Law</h3>
                        <p>
                            These Terms shall be governed by and defined following the laws of India and the User irrevocably consents that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
