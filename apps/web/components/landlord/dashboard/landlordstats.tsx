"use client";

import { Banknote, DoorOpen, ClipboardList, FileText, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getStablecoinMint } from "@repo/anchor";
import { Loader2 } from "lucide-react";

export const LandlordStats = ({ stats: apiStats }: { stats?: any }) => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!publicKey) return;
            try {
                const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: connection.rpcEndpoint });
                const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
                const balanceResponse = await connection.getTokenAccountBalance(ata);
                const uiAmount = balanceResponse.value.uiAmount || 0;
                setUsdcBalance(uiAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            } catch (e) {
                setUsdcBalance("0.00");
            }
        };
        fetchBalance();
        
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [publicKey, connection]);

    const stats = [
        { 
            title: "Wallet Balance", 
            value: usdcBalance !== null ? `${usdcBalance} USDC` : "Loading...", 
            icon: Wallet, 
            color: "text-sol-emerald",
            bg: "bg-sol-emerald/10"
        },
        { 
            title: "Total Revenue", 
            value: apiStats?.totalRent ? `${apiStats.totalRent.toLocaleString()} USDC` : "0 USDC", 
            icon: Banknote, 
            color: "text-secondary-500",
            bg: "bg-secondary-50"
        },
        { 
            title: "Occupancy Rate", 
            value: apiStats?.occupancyRate ? `${apiStats.occupancyRate}%` : "0%", 
            icon: DoorOpen, 
            color: "text-primary-600",
            bg: "bg-primary-50"
        },
        { 
            title: "Active Leases", 
            value: apiStats?.activeLeases || "0", 
            icon: FileText, 
            color: "text-secondary-600",
            bg: "bg-secondary-50"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <Card key={stat.title} className="bg-white border border-background-100 shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-text-400">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <h2 className="text-3xl font-black text-primary-900 tracking-tight">{stat.value}</h2>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};