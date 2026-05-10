import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Input } from "@repo/ui/components/ui/input";
import { Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export function WalletSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-auth-navy ml-1">
                <Wallet className="h-5 w-5 text-sol-indigo" />
                <h2 className="text-lg font-black uppercase tracking-wider">Treasury & Settlement</h2>
            </div>

            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-8 border-b border-slate-50 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Primary Settlement Address (Solana)</label>
                            <div className="flex gap-3">
                                <Input
                                    value="7xKX...Zp4n"
                                    readOnly
                                    className="h-12 rounded-xl bg-slate-50 border-dashed border-slate-200 font-mono text-sm text-auth-navy"
                                />
                                <Button variant="outline" className="h-12 rounded-xl px-6 font-bold border-slate-200">Change Wallet</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm text-auth-navy">Auto-Swap to USDC</p>
                                    <p className="text-[10px] text-text-grey">Automatically convert PYUSD payments to USDC.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm text-auth-navy">Instant Withdraw</p>
                                    <p className="text-[10px] text-text-grey">Push rent directly to ledger wallet on settlement.</p>
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