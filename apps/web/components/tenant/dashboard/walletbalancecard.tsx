import { Button } from "@repo/ui/components/ui/button";

export const BalanceCard = () => (
    <div className="bg-primary-950 text-white rounded-[12px] p-8 shadow-lg h-full flex flex-col justify-between">
        <p className="text-[10px] font-bold tracking-[0.2em] text-text-400 uppercase">Solana Mainnet</p>
        <div className="mt-4 mb-8">
            <p className="text-text-400 mb-1">Current Balance</p>
            <h3 className=" font-bold flex items-baseline gap-2 text-white">
                2,450.42 <span className="text-text-400 font-medium">USDC</span>
            </h3>
        </div>
        <div className="flex gap-3">
            <Button className="flex-1 bg-white text-text-950 font-bold rounded-lg h-12">
                Top Up
            </Button>
            <Button variant="outline" className="flex-1 border-primary-700 bg-primary-800/50 hover:bg-primary-700 text-white font-bold rounded-lg h-12">
                Withdraw
            </Button>
        </div>
    </div>
);