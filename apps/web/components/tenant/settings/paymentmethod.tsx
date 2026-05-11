"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Wallet, Smartphone, CreditCard } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useWallet } from "@solana/wallet-adapter-react";

export function PaymentMethods() {
    const { user, logout } = useAuth();
    const { disconnect } = useWallet();
    
    const handleDisconnect = async () => {
        try {
            await disconnect();
            await logout();
            window.location.href = "/login";
        } catch (e) {
            console.error("Disconnect failed", e);
        }
    };

    const shortWallet = user?.walletAddress
        ? `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`
        : "Not Connected";

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary-900 ml-1">
                <CreditCard className="h-5 w-5 text-secondary-500" />
                <h2 className="text-lg font-black uppercase tracking-wider">Payment Configuration</h2>
            </div>

            <Card className="rounded-3xl border-background-100 bg-white shadow-sm overflow-hidden">
                <div className="p-8 border-b border-background-50 flex items-center justify-between bg-background-50/30">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-background-100">
                            <Wallet className="h-6 w-6 text-secondary-500" />
                        </div>
                        <div>
                            <p className="font-black text-primary-900 text-sm">Linked Solana Wallet</p>
                            <p className="font-mono text-[10px] text-text-400">{shortWallet}</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleDisconnect}
                        variant="outline" 
                        className="rounded-xl font-bold text-xs h-10 px-4 border-background-200 transition-colors hover:bg-destructive hover:text-white hover:border-destructive"
                    >
                        Disconnect
                    </Button>
                </div>

                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-background-100 bg-background-50/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background-100 rounded-xl">
                                <Smartphone className="h-5 w-5 text-text-400" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-primary-900">Mobile App Notifications</p>
                                    <Badge className="bg-secondary-500/10 text-secondary-500 border-none text-[8px] font-black uppercase px-2 py-0">Upcoming</Badge>
                                </div>
                                <p className="text-[10px] text-text-400">Push alerts 3 days before rent is due. Coming soon to iOS & Android.</p>
                            </div>
                        </div>
                        <Button disabled size="sm" variant="ghost" className="text-text-300 font-black text-[10px] uppercase cursor-not-allowed">Coming Soon</Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}