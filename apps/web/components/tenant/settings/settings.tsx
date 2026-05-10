import { ExternalLink, FileText, Shield } from "lucide-react";

export function SecurityPrivacy() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-auth-navy ml-1">
                <Shield className="h-5 w-5 text-sol-indigo" />
                <h2 className="text-lg font-black uppercase tracking-wider">Residency Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-sol-indigo transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="bg-sol-indigo/5 p-3 rounded-2xl">
                            <FileText className="h-6 w-6 text-sol-indigo" />
                        </div>
                        <div>
                            <p className="font-bold text-auth-navy text-sm">Active Lease Agreement</p>
                            <p className="text-[10px] text-text-grey uppercase font-bold tracking-tighter">Signed Oct 2023 • PDF</p>
                        </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-sol-indigo" />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-sol-indigo transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl">
                            <Shield className="h-6 w-6 text-sol-emerald" />
                        </div>
                        <div>
                            <p className="font-bold text-auth-navy text-sm">Proof of Residency</p>
                            <p className="text-[10px] text-text-grey uppercase font-bold tracking-tighter">On-Chain Certificate</p>
                        </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-sol-emerald" />
                </div>
            </div>
        </section>
    );
}