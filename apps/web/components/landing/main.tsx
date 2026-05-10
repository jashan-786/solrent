import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function Main() {
    return (
        <main className="flex flex-col md:flex-row items-center justify-between h-max px-4 md:px-8 py-10 gap-10">

            <section className="w-full md:w-1/2 flex flex-col gap-6">
                <div>
                    <h1 className="leading-tight mb-4 text-primary-950">Automated Rent Collection on Solana</h1>
                    <p className="text-lg text-text-600 leading-relaxed">The institutional-grade protocol for stablecoin rent automation. Collect USDC instantly, minimize fees, and issue Proof of Rent NFTs to verified tenants.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a href="/register">
                        <Button
                            className="bg-gradient-to-r from-primary-900 to-primary-800 text-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-primary-900/20 border-none px-8 py-6 rounded-2xl font-black text-lg flex items-center gap-2"
                            size="lg"
                        >
                            Start Collecting <ArrowRight className="h-5 w-5" />
                        </Button>
                    </a>
                </div>

                <div className="flex flex-row gap-8 justify-start mt-4">
                    <div className="flex flex-col">
                        <h6 className="text-2xl font-black text-primary-900 leading-none">0.1%</h6>
                        <p className="text-xs font-bold text-text-400 uppercase tracking-widest mt-1">Network Fee</p>
                    </div>

                    <div className="flex flex-col">
                        <h6 className="text-2xl font-black text-secondary-600 leading-none">Instant</h6>
                        <p className="text-xs font-bold text-text-400 uppercase tracking-widest mt-1">Settlement</p>
                    </div>
                </div>
            </section>

            <section className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-secondary-500 rounded-4xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-2 bg-white shadow-2xl rounded-4xl border border-background-100 overflow-hidden">
                        <Image
                            src="/building-landing.png"
                            alt="building"
                            width={1000}
                            height={1000}
                            className="w-full h-auto object-contain rounded-2xl transform hover:scale-[1.01] transition-transform duration-500"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}