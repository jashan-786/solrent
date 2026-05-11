"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Input } from "@repo/ui/components/ui/input";
import { Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export function WalletSection({ walletAddress, setWalletAddress }: { walletAddress: string, setWalletAddress: (v: string) => void }) {
    const { publicKey } = useWallet();

    const handleSyncWallet = () => {
        if (publicKey) {
            setWalletAddress(publicKey.toBase58());
        } else {
            alert("Please connect your wallet first via the top bar.");
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary-900 ml-1">
                <Wallet className="h-5 w-5 text-secondary-500" />
                <h2 className="text-lg font-black uppercase tracking-wider">Treasury & Settlement</h2>
            </div>

            <Card className="rounded-[32px] border-background-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-8 border-b border-background-50 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-400">Primary Settlement Address (Solana)</label>
                            <div className="flex gap-3">
                                <Input
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder="Enter Solana Wallet Address"
                                    className="h-12 rounded-xl bg-background-50 border-solid border-background-200 font-mono text-sm text-primary-900"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleSyncWallet}
                                    className="h-12 rounded-xl px-6 font-bold border-background-200 text-primary-900"
                                >
                                    Use Connected Wallet
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="flex items-center justify-between p-4 bg-background-50 rounded-2xl border border-background-100">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm text-primary-900">Auto-Swap to USDC</p>
                                    <p className="text-[10px] text-text-400">Automatically convert incoming payments to USDC.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-background-50 rounded-2xl border border-background-100">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm text-primary-900">Instant Withdraw</p>
                                    <p className="text-[10px] text-text-400">Push rent directly to ledger wallet on settlement.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}