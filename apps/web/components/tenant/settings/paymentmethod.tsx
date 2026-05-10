import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Wallet, Smartphone, ExternalLink, CreditCard } from "lucide-react";

export function PaymentMethods() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-auth-navy ml-1">
                <CreditCard className="h-5 w-5 text-sol-indigo" />
                <h2 className="text-lg font-black uppercase tracking-wider">Payment Configuration</h2>
            </div>

            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                            <Wallet className="h-6 w-6 text-sol-indigo" />
                        </div>
                        <div>
                            <p className="font-black text-auth-navy text-sm">Linked Solana Wallet</p>
                            <p className="font-mono text-[10px] text-text-grey">7xKX...Zp4n</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4 border-slate-200">Disconnect</Button>
                </div>

                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-slate-400" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-auth-navy">Mobile App Notifications</p>
                                <p className="text-[10px] text-text-grey">Receive push alerts 3 days before rent is due.</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-sol-indigo font-black text-[10px] uppercase">Setup</Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}