export default function ShippingInfo() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Client Operations</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Shipping<br />Data
                    </h1>
                </header>

                <div className="font-mono text-sm leading-relaxed space-y-8 text-black/80">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">01. Global Dispatch</h3>
                        <p>
                            We ship worldwide via DHL Express and specialized logistics partners. All international orders are processed within 24-48 hours of verification.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">02. Duties & Taxes</h3>
                        <p>
                            <strong>India:</strong> All taxes are included in the listed price.<br />
                            <strong>International:</strong> Duties and taxes are calculated at checkout where possible. If not collected at checkout, the recipient is responsible for any applicable customs fees upon delivery.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">03. Tracking Protocol</h3>
                        <p>
                            Once dispatched, a secure tracking signal will be transmitted to your registered email. You may monitor your artifacts journey via the Order Status portal.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">04. Delivery Timelines</h3>
                        <ul className="list-disc pl-4 space-y-2 mt-2">
                            <li>Domestic (India): 2-5 Business Days</li>
                            <li>International (Major Hubs): 3-7 Business Days</li>
                            <li>International (Remote): 7-14 Business Days</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
