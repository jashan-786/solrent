"use client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Wallet, ArrowUpRight, Clock, AlertCircle, Loader2 } from "lucide-react";

export function PaymentStats({ data, isLoading }: { data: any, isLoading: boolean }) {

    return (

        (isLoading) ?
            (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
                </div>
            ) :

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-none bg-primary-950 text-white shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet className="h-24 w-24" />
                    </div>
                    <CardContent className="p-8 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-400">Total Volume (30d)</p>
                        <div className="space-y-1">
                            <h2 className="text-4xl  text-white font-black italic tracking-tighter">${data?.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</h2>
                            <p className="text-xs text-secondary-500 font-bold flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" /> {data?.percentage?.toFixed(1) || 0}% Completion Rate
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <StatCard title="Pending Settlements" value={data?.pendingSettlements || 0} unit="PYUSD" icon={<Clock className="h-5 w-5" />} color="orange" />
                <StatCard title="Failed Transfers" value={data?.failedTransfers || 0} unit="TXS" icon={<AlertCircle className="h-5 w-5" />} color="red" />
            </div>
    );
}

function StatCard({ title, value, unit, icon, color }: any) {
    const colors = {
        orange: "bg-accent-100 text-accent-600",
        red: "bg-secondary-100 text-secondary-600"
    };
    return (
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm border">
            <CardContent className="p-8 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-500">{title}</p>
                <div className="flex items-end justify-between">
                    <h2 className={`text-3xl font-black tracking-tight ${color === 'red' ? 'text-secondary-600' : 'text-text-950'}`}>
                        {value} <span className="text-sm font-bold text-text-400">{unit}</span>
                    </h2>
                    <div className={`p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}