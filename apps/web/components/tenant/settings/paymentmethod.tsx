"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Wallet, Smartphone, CreditCard } from "lucide-react";
import { useAuth } from "@/store/useAuth";

export function PaymentMethods() {
    const { user } = useAuth();
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
                    <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4 border-background-200">Disconnect</Button>
                </div>

                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-background-100">
                        <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-text-400" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-primary-900">Mobile App Notifications</p>
                                <p className="text-[10px] text-text-400">Receive push alerts 3 days before rent is due.</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-secondary-500 font-black text-[10px] uppercase">Setup</Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}