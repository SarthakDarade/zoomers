export default function ReturnsPortal() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Client Operations</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Returns<br />Portal
                    </h1>
                </header>

                <div className="font-mono text-sm leading-relaxed space-y-8 text-black/80">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">01. Return Eligibility</h3>
                        <p>
                            Artifacts may be returned within 14 days of delivery receipt. Items must be unworn, unwashed, and in original condition with all tags and security seals intact.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">02. Initiation Protocol</h3>
                        <p>
                            To initiate a return, please contact our support signal at <strong>support@zoomers.archive</strong> with your Order ID and reason for return. A return authorization label will be generated for eligible requests.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold uppercase tracking-widest mb-4 text-black">03. Refund Processing</h3>
                        <p>
                            Upon receipt and inspection at our facility, refunds will be processed to the original payment method within 5-7 business days. Shipping costs are non-refundable.
                        </p>
                    </section>

                    <section className="bg-neutral-100 p-6 border border-neutral-200">
                        <h3 className="font-bold uppercase tracking-widest mb-2 text-black text-xs">Note on Archive Sale Items</h3>
                        <p className="text-xs">
                            Items marked as "Final Sale" or purchased during "Archive Clearance" events are not eligible for return or exchange unless functionally defective.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
