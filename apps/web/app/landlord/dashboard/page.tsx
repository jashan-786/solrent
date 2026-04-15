import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { LandlordStats } from "@/components/landlord/dashboard/landlordstats";
import { RevenueChart } from "@/components/landlord/dashboard/revenuecharts";
import { TransactionLedger } from "@/components/landlord/dashboard/ledger";
import { OccupancyTracker } from "@/components/landlord/dashboard/occupancytracker";
import { Bell, Wallet, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {/* 1. Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-block relative">
                        <h2 className="text-auth-navy tracking-tight">Financial Ledger</h2>
                        <div className="absolute bottom-1 left-0 w-full h-[3px] bg-sol-indigo rounded-full" />
                    </div>
                    <p className="text-text-grey mt-2">
                        Monitoring property revenue and smart-contract settlements.
                    </p>
                </div>
                <Badge variant="outline" className="h-10 px-4 gap-2 border-border bg-white">
                    <Wallet size={16} className="text-sol-emerald" />
                    <span className="font-mono text-sm text-auth-navy font-bold">0x82...f92a</span>
                </Badge>
            </header>

            {/* 2. Key Metrics Grid */}
            <LandlordStats />

            {/* 3. Main Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Revenue & Table (8/12 Columns) */}
                <div className="lg:col-span-8 space-y-8">
                    <RevenueChart />
                    <TransactionLedger />
                </div>

                {/* RIGHT: Notifications & Occupancy (4/12 Columns) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Recent Notifications Card */}
                    <Card className="bg-auth-navy border-none shadow-xl text-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h5 className="text-white">Recent Notifications</h5>
                            <Badge variant="destructive" className="text-tiny h-5 uppercase">New</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-auth-slate/50 border border-slate-700/30 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-tiny font-bold text-sol-emerald uppercase">Solana Payment</span>
                                    <span className="text-tiny text-slate-400">2m ago</span>
                                </div>
                                <p className="text-sm text-slate-300">Rental payment of 42.5 SOL received for Unit A4.</p>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-2 text-tiny font-bold text-sol-emerald hover:text-white transition-colors">
                                View All Notifications <ArrowUpRight size={14} />
                            </button>
                        </CardContent>
                    </Card>

                    <OccupancyTracker />

                    {/* Mini Portfolio Summary Card */}
                    <Card className="bg-card border-none shadow-sm">
                        <CardHeader>
                            <h6 className="text-auth-navy uppercase tracking-widest text-tiny">Wallet Activity</h6>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-surface-secondary">
                                    <Bell size={16} className="text-auth-navy" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-auth-navy">Contract Deployed</p>
                                    <p className="text-tiny text-text-grey">New Building NFT • 4 hours ago</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}