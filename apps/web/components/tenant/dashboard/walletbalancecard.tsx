import { Button } from "@repo/ui/components/ui/button";

export const BalanceCard = () => (
    <div className="bg-brand-navy text-white rounded-twelve p-8 shadow-lg h-full bg-[#131B2E] rounded-[12px] flex flex-col justify-between">
        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Solana Mainnet</p>
        <div className="mt-4 mb-8">
            <p className="text-slate-400 mb-1">Current Balance</p>
            <h3 className=" font-bold flex items-baseline gap-2 text-white">
                2,450.42 <span className="text-slate-400 font-medium">USDC</span>
            </h3>
        </div>
        <div className="flex gap-3">
            <Button className="flex-1 bg-white text-brand-navy text-accent-foreground hover:bg-slate-100 font-bold rounded-lg h-12">
                Top Up
            </Button>
            <Button variant="outline" className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white font-bold rounded-lg h-12">
                Withdraw
            </Button>
        </div>
    </div>
);