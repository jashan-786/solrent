import { Card } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Switch } from "@repo/ui/components/ui/switch";
import { Building } from "lucide-react";

export function PreferencesSection() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-auth-navy ml-1">
                <Building className="h-5 w-5 text-sol-indigo" />
                <h2 className="text-lg font-black uppercase tracking-wider">Lease Defaults</h2>
            </div>

            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Default Grace Period</label>
                        <div className="relative">
                            <Input type="number" defaultValue="3" className="h-12 rounded-xl bg-surface-secondary border-none font-bold" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Days</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Late Fee Percentage</label>
                        <div className="relative">
                            <Input type="number" defaultValue="5" className="h-12 rounded-xl bg-surface-secondary border-none font-bold" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">%</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-grey">Contract Auto-Renewal</label>
                        <div className="h-12 flex items-center">
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    );
}