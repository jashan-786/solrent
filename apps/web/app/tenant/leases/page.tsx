import { ContractTimeline } from "@/components/tenant/lease/contracttimeline";
import { FinancialBreakdown } from "@/components/tenant/lease/financialbreakdown";
import { LeaseDetailsCard } from "@/components/tenant/lease/leasedetails";
import { PaymentSchedule } from "@/components/tenant/lease/paymentschedule";
import { Button } from "@repo/ui/components/ui/button";

export default function LeasePage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Institutional Ledger</p>
            <h1 className="text-5xl font-bold text-brand-navy mb-8">Lease Agreement Detail</h1>

            <div className="flex flex-col  md:flex-col gap-6 items-stretch">
                <div className="flex flex-col md:flex-row gap-6">
                    <LeaseDetailsCard />
                    <ContractTimeline />
                </div>

                <div className=" w-full space-y-6">


                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Sidebar Stacks */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-surface-secondary rounded-twelve p-6 text-center rounded-[12px]">
                                <h3 className="font-bold mb-4">Legal Agreement</h3>
                                <div className="bg-white p-8 rounded-xl border border-gray-200 mb-4">
                                    <div className="w-12 h-16 bg-gray-100 mx-auto rounded mb-2 border-2 border-dashed border-gray-300" />
                                    <p className="text-xs font-bold">Residential_Lease_v2.pdf</p>
                                </div>
                                <Button variant="outline" className="w-full">Download PDF</Button>
                            </div>
                            <FinancialBreakdown />
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-8 space-y-6">
                            <PaymentSchedule />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-surface-secondary rounded-twelve p-6 border-l-4 border-red-400 rounded-[12px]">
                                    <h4 className="font-bold flex items-center gap-2 mb-4 text-brand-navy">
                                        <span className="text-red-500">⚠️</span> Late Fee Rules
                                    </h4>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        Payments due by the 5th. A late fee of <span className="font-bold text-brand-navy">50 USDC</span> applies after the 5th.
                                    </p>
                                </div>
                                <div className="bg-surface-secondary rounded-twelve p-6 border-l-4 border-solrent-indigo rounded-[12px]">
                                    <h4 className="font-bold flex items-center gap-2 mb-4 text-brand-navy">
                                        <span className="text-solrent-indigo">🍃</span> Utility Policy
                                    </h4>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        Water and trash included. Electricity and internet are tenant responsibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}