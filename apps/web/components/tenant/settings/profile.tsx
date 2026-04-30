import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { User } from "lucide-react";

export function Profile() {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2 text-auth-navy">
                    <User className="h-5 w-5 text-sol-indigo" />
                    <h2 className="text-lg font-black uppercase tracking-wider">Identity</h2>
                </div>
                <Badge className="bg-sol-emerald/10 text-sol-emerald border-none font-black px-4 py-1 rounded-full text-[10px]">
                    VERIFIED TENANT
                </Badge>
            </div>

            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Legal Name</Label>
                        <Input defaultValue="Marcus Thorne" className="h-12 rounded-xl bg-surface-secondary border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Email Address</Label>
                        <Input defaultValue="marcus.t@web3mail.com" className="h-12 rounded-xl bg-surface-secondary border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Current Unit</Label>
                        <Input readOnly value="Azure Heights • Unit 1402" className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Emergency Contact</Label>
                        <Input placeholder="+1 (xxx) xxx-xxxx" className="h-12 rounded-xl bg-surface-secondary border-none font-bold" />
                    </div>
                </div>
            </Card>
        </section>
    );
}