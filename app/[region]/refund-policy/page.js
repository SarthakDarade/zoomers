export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Terms of Engagement</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Refund &<br />Cancellation
                    </h1>
                </header>

                <div className="font-mono text-sm leading-relaxed space-y-12 text-black/90">

                    {/* Cancellation Section */}
                    <section>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="text-[#cd2b2b]">01.</span> Order Cancellation
                        </h3>
                        <div className="pl-4 border-l-2 border-black/10 space-y-4">
                            <p>
                                <strong>Pre-Dispatch:</strong> You may request a cancellation of your order at any time before it has been dispatched from our facility. Contact <span className="underline">support@zoomers.archive</span> immediately with your Order ID. If the cancellation is processed in time, a full refund will be issued immediately.
                            </p>
                            <p>
                                <strong>Post-Dispatch:</strong> Once an order has entered the logistics network (shipped), it cannot be cancelled. It must be treated as a Return upon delivery.
                            </p>
                        </div>
                    </section>

                    {/* Return & Refund Section */}
                    <section>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="text-[#cd2b2b]">02.</span> Returns & Refunds
                        </h3>
                        <div className="pl-4 border-l-2 border-black/10 space-y-4">
                            <p>
                                <strong>Timeline:</strong> We accept returns for all standard artifacts within 14 days of delivery.
                            </p>
                            <p>
                                <strong>Condition:</strong> Items must be returned in their original complexity—unworn, unwashed, and with all branding tags and security seals strictly intact. Items that show signs of wear or damage will be rejected and returned to the sender.
                            </p>
                            <p>
                                <strong>Refund Execution:</strong> Upon passing inspection at our HQ, refunds are initiated to the original payment source. Please allow 5-7 business days for banking protocols to reflect the credit.
                            </p>
                            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-4">
                                * Shipping costs are non-refundable components of the transaction.
                            </p>
                        </div>
                    </section>

                    {/* Defective Items */}
                    <section>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <span className="text-[#cd2b2b]">03.</span> Manufacturing Anomalies
                        </h3>
                        <div className="pl-4 border-l-2 border-black/10 space-y-4">
                            <p>
                                While our quality control is rigorous, anomalies occur. If you receive a defective or incorrect artifact, please notify us within 48 hours of receipt. We will arrange a priority replacement or a full refund, including all shipping costs.
                            </p>
                        </div>
                    </section>

                    {/* Contact Block */}
                    <div className="bg-black text-white p-8 mt-12">
                        <p className="font-bold uppercase tracking-widest text-xs mb-2 text-white/50">Official Support Channel</p>
                        <p className="text-xl font-mono">support@zoomers.archive</p>
                        <p className="text-xs mt-4 text-white/70">Response Time: Within 24 Hours</p>
                    </div>

                </div>
            </div>
        </div>
    )
}
