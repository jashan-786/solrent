"use client";

import useSWR, { mutate } from "swr";
import axios from "axios";
import { useState } from "react";
import { ContractTimeline } from "@/components/tenant/lease/contracttimeline";
import { FinancialBreakdown } from "@/components/tenant/lease/financialbreakdown";
import { LeaseDetailsCard } from "@/components/tenant/lease/leasedetails";
import { PaymentSchedule } from "@/components/tenant/lease/paymentschedule";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function LeasePage() {
    const { data, isLoading } = useSWR("/api/tenant/leases", fetcher);
    
    const [approving, setApproving] = useState(false);
    const [approvingTermination, setApprovingTermination] = useState(false);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const actionNeededLease = data?.leases?.find((l: any) => 
        l.status === "PENDING" || l.status === "TERMINATION_REQUESTED"
    );

    const latestActiveLease = data?.leases?.findLast((l: any) => l.status === "ACTIVE");
    const lease = actionNeededLease || latestActiveLease || data?.leases?.[data?.leases?.length - 1];

    if (!lease) return (
        <div className="p-10 text-center">
            <h2 className="text-2xl font-bold text-primary-900">No Active Lease Found</h2>
            <p className="text-text-500 mt-2">You don't have any active lease agreements at the moment.</p>
        </div>
    );

    const handleDownload = () => {
        if (!lease) return;
        const text = `SOLRENT - OFFICIAL LEASE AGREEMENT
=================================
Building: ${lease.unit?.building?.name}
Unit: ${lease.unit?.unitNumber}
Monthly Rent: ${lease.monthlyRent} ${lease.stablecoin}
Start Date: ${new Date(lease.startDate).toLocaleDateString()}
End Date: ${new Date(lease.endDate).toLocaleDateString()}

ON-CHAIN VERIFICATION
=================================
Lease PDA: ${lease.onChainAddress || 'Pending'}
Lease NFT Mint: ${lease.leaseNftMint || 'Pending'}

TERMS
=================================
- Payments due by the 5th of each month.
- A late fee of 50 USDC applies after the 5th.
- Water and trash included.
- Electricity and internet are tenant responsibility.
`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lease_Agreement_${lease.id.slice(0, 5)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleViewLeasePdf = () => {
        if (!lease?.leaseDocumentUrl) {
            alert("No lease PDF is attached yet.");
            return;
        }
        window.open(`/api/leases/${lease.id}/document-url`, "_blank");
    };

    const handleAcceptLeaseTerms = async () => {
        if (!lease?.id) return;
        try {
            setApproving(true);
            await axios.post("/api/tenant/leases/approve", { leaseId: lease.id });
            await mutate("/api/tenant/leases");
            await mutate("/api/tenant/dashboard");
        } catch (error: any) {
            alert(error?.response?.data?.message || "Failed to accept lease terms");
        } finally {
            setApproving(false);
        }
    };

    const handleApproveTermination = async () => {
        if (!lease?.id) return;
        if (!confirm("Approving termination will end your lease and free the unit. Continue?")) return;
        try {
            setApprovingTermination(true);
            await axios.post("/api/tenant/leases/approve-termination", { leaseId: lease.id });
            await mutate("/api/tenant/leases");
            await mutate("/api/tenant/dashboard");
        } catch (error: any) {
            alert(error?.response?.data?.message || "Failed to approve termination");
        } finally {
            setApprovingTermination(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <p className="text-[11px] font-bold text-text-400 uppercase tracking-widest mb-2">Institutional Ledger</p>
            <h1 className="text-5xl font-bold text-primary-900 mb-8">Lease Agreement Detail</h1>

            <div className="flex flex-col gap-6 items-stretch">
                <div className="flex flex-col md:flex-row gap-6">
                    <LeaseDetailsCard lease={lease} />
                    <ContractTimeline lease={lease} />
                </div>

                <div className="w-full space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-background-100">
                                <h3 className="font-bold mb-4 text-primary-900">Legal Agreement</h3>
                                <div className="bg-background-50 p-8 rounded-xl border border-background-100 mb-4">
                                    <div className="w-12 h-16 bg-background-200 mx-auto rounded mb-2 border-2 border-dashed border-background-300 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-text-400">TXT</span>
                                    </div>
                                    <p className="text-xs font-bold text-primary-900">Residential_Lease_{lease.id.slice(0,5)}.txt</p>
                                </div>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full font-bold" onClick={handleViewLeasePdf}>
                                        View Lease PDF
                                    </Button>
                                    <Button variant="outline" className="w-full font-bold" onClick={handleDownload}>
                                        Download TXT
                                    </Button>
                                    {lease?.status === "PENDING" && (
                                        <Button
                                            className="w-full font-bold bg-auth-navy hover:bg-auth-slate text-white"
                                            onClick={handleAcceptLeaseTerms}
                                            disabled={approving}
                                        >
                                            {approving ? "Accepting..." : "Accept Lease Terms"}
                                        </Button>
                                    )}
                                    {lease?.status === "TERMINATION_REQUESTED" && (
                                        <Button
                                            className="w-full font-bold bg-destructive hover:bg-destructive/90 text-white"
                                            onClick={handleApproveTermination}
                                            disabled={approvingTermination}
                                        >
                                            {approvingTermination ? "Approving..." : "Approve Termination"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <FinancialBreakdown lease={lease} />
                        </div>

                        <div className="lg:col-span-8 space-y-6">
                            <PaymentSchedule payments={lease.payments} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-background-50 rounded-xl p-6 border-l-4 border-secondary-400">
                                    <h4 className="font-bold flex items-center gap-2 mb-4 text-primary-900">
                                        <span className="text-secondary-500">⚠️</span> Late Fee Rules
                                    </h4>
                                    <p className="text-sm text-text-600 leading-relaxed">
                                        Payments due by the 5th. A late fee of <span className="font-bold text-primary-900">50 USDC</span> applies after the 5th.
                                    </p>
                                </div>
                                <div className="bg-background-50 rounded-xl p-6 border-l-4 border-sol-indigo">
                                    <h4 className="font-bold flex items-center gap-2 mb-4 text-primary-900">
                                        <span className="text-sol-indigo">🍃</span> Utility Policy
                                    </h4>
                                    <p className="text-sm text-text-600 leading-relaxed">
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