import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Bolt, RefreshCcw, ShieldPlus, Zap } from "lucide-react";
import { HeroCard } from "./herocard";

export function Hero() {
    return (
        <section id="features" className="w-full h-full  flex flex-col items-center  bg-gray-100 px-4 md:px-8 py-10">
            <div >
                <h2 className="text-center">Institutional Features</h2>
                <div className="flex flex-row justify-center">
                    <p className="text-center w-1/2">Built for property managers who demand precision and speed. The Editorial Ledger provides the infrastructure for the next generation of real estate.</p>
                </div>
            </div>

            <div className="flex flex-col justify-center my-16 items-center gap-7 md:flex-row w-full md:w-3/4">

                <HeroCard icon={<RefreshCcw />} title="Recurring Automation" description="Set up immutable rental streams. Payments are triggered automatically on the first of each month, directly from tenant vaults." />
                <HeroCard icon={<Bolt />} title="Proof of Rent NFTs" description="Each payment mints a soulbound NFT receipt. Tenants build a verified, on-chain credit history for future rentals." />
                <HeroCard icon={<Zap />} title="Ultra-Low Fees" description="Stop losing 3% to traditional processors. Leverage Solana's high-speed network for sub-penny transaction costs." />

            </div>
        </section>
    );
}   