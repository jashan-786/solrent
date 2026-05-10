import { Button } from "@repo/ui/components/ui/button";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function Main() {
    return (
        <main className="flex flex-col md:flex-row items-center justify-between h-max px-4 md:px-8 py-10 gap-10">
            {/* 1. Left Side: Content */}
            <section className="w-full md:w-1/2 flex flex-col gap-6">
                <div>
                    <h1 className="leading-tight mb-4">Automated Rent Collection on Solana</h1>
                    <p className="text-lg opacity-90">The institutional-grade protocol for stablecoin rent automation. Collect USDC instantly, minimize fees, and issue Proof of Rent NFTs to verified tenants.</p>
                </div>
                <div>
                    <Button className="bg-black text-white" size="lg"> Start Collecting <ArrowRight /> </Button>
                </div>

                <div className="flex flex-row gap-6 justify-start">
                    <div className=" flex  flex-col">
                        <h6>0.1%</h6>
                        <p>Network Fee</p>
                    </div>

                    <div className=" flex  flex-col">
                        <h6 className="font-bold">Instant </h6>
                        <p>Settlement</p>
                    </div>

                </div>
            </section>

            {/* 2. Right Side: Graphic */}
            <section className="w-full md:w-1/2 mt-8 md:mt-0">
                <section className="w-full h-full relative">
                    <div className="p-2 shadow-lg rounded-2xl">
                        <Image src="/building-landing.png" alt="building" width={1000} height={1000} className="w-full h-auto object-contain rounded-2xl" />
                    </div>
                </section>
            </section>
        </main>
    );
}