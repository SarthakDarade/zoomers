export default function AboutUs() {
    return (
        <div className="min-h-screen bg-white text-black pt-32 px-6 md:px-12 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-20 border-b-4 border-black pb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#cd2b2b] mb-4 block">Our Identity</span>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                        The<br />Archive
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 font-mono text-sm leading-relaxed text-black/90">

                    {/* Column 1 */}
                    <div className="space-y-12">
                        <section>
                            <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-black"></span>
                                Origin
                            </h3>
                            <p className="text-justify">
                                Zoomers emerged from the concrete dissonance of London. We are not a fashion label; we are an observation of the modern uniform. In an era of infinite noise, we construct silence. Our garments are engineered to function as armor for the contemporary operator—utilitarian, distinct, and devoid of unnecessary signaling.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-black"></span>
                                Philosophy
                            </h3>
                            <p className="text-justify">
                                We reject the seasonal cycle. We build artifacts meant to persist. Each collection is a "System Update," refining the user's interface with their environment. We believe in brutalist simplicity, raw materials, and the beauty of industrial precision.
                            </p>
                        </section>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-12">
                        <section>
                            <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-black"></span>
                                Methodology
                            </h3>
                            <p className="text-justify">
                                Every piece is designed in our London studio and manufactured with partners who share our obsession with detail. From the weight of the cotton to the tension of the stitch, parameter is calculated. We do not mass produce; we release limited batches to ensure quality control and exclusivity.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-black/10">
                            <p className="uppercase font-bold tracking-widest mb-2">Headquarters</p>
                            <p>London, United Kingdom</p>
                            <p>Global Dispatch</p>
                        </div>
                    </div>

                </div>

                {/* Manifesto Footer */}
                <div className="mt-32 p-12 bg-black text-white flex flex-col items-center justify-center text-center">
                    <p className="uppercase tracking-[0.2em] text-xs mb-6 text-white/50">Mission Statement</p>
                    <p className="text-2xl md:text-4xl font-black uppercase tracking-tighter max-w-2xl leading-tight">
                        "To equip the generation that never sleeps with the uniform they deserve."
                    </p>
                </div>
            </div>
        </div>
    )
}
