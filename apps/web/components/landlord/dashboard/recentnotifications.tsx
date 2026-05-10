import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";

export const RecentNotifications = () => (
    <Card className="bg-brand-navy border-none shadow-xl text-white">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Notifications</CardTitle>
            <Badge variant="destructive" className="text-[9px] h-5 uppercase">New</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-solrent-emerald uppercase">Solana Payment</span>
                    <span className="text-[10px] text-slate-400">2m ago</span>
                </div>
                <p className="text-xs text-slate-300">Rental payment of 42.5 SOL received for Unit A4.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1 opacity-70">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-solrent-indigo uppercase">Smart Contract</span>
                    <span className="text-[10px] text-slate-400">4h ago</span>
                </div>
                <p className="text-xs text-slate-300">NFT metadata for Harbor Point updated successfully.</p>
            </div>

            <button className="w-full py-2 text-xs font-bold text-solrent-emerald hover:text-white transition-colors">
                View All Notifications
            </button>
        </CardContent>
    </Card>
);