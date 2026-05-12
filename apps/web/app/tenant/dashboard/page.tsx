"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import TenantDashboardTopbar from "@/components/tenant/dashboard/topbar";
import TenantIntro from "@/components/tenant/dashboard/tenantintro";
import BriefInfo from "@/components/tenant/dashboard/briefinfo";
import PropertyHeader from "@/components/tenant/dashboard/propertyheader";
import { BalanceCard } from "@/components/tenant/dashboard/walletbalancecard";
import PaymentHistory from "@/components/tenant/dashboard/paymenthistory";
import { PayRentModal } from "@/components/tenant/dashboard/payrentmodal";
import { MaintenanceModal } from "@/components/tenant/dashboard/maintenancemodal";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function TenantDashboardPage() {
    const { data, isLoading } = useSWR("/api/tenant/dashboard", fetcher);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

    if (isLoading) return <DashboardSkeleton />;

    const dashboard = data?.dashboard;
    const activeLease = dashboard?.activeLease;

    return (
        <div className="flex flex-col gap-4 p-4">
            <TenantDashboardTopbar />
            {!dashboard?.profile?.walletAddress && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-2xl mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Wallet Disconnected</AlertTitle>
                    <AlertDescription className="font-medium">
                        Your account is not linked to a Solana wallet. You must connect your wallet to pay rent and receive NFT receipts.
                    </AlertDescription>
                </Alert>
            )}

            {activeLease?.status === "PENDING" && (
                <Alert className="bg-sol-indigo/5 border-sol-indigo/20 text-sol-indigo rounded-2xl mb-4">
                    <AlertCircle className="h-4 w-4 text-sol-indigo" />
                    <AlertTitle className="font-bold">Lease Acceptance Required</AlertTitle>
                    <AlertDescription className="font-medium flex items-center justify-between">
                        <span>A new lease has been created for you. Please review and accept the terms to activate your tenancy.</span>
                        <a href="/tenant/leases" className="px-4 py-1 bg-sol-indigo text-white rounded-lg text-sm font-bold hover:bg-sol-indigo/90 transition-colors ml-4">
                            Review Lease
                        </a>
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex justify-between items-center">
                <TenantIntro name={dashboard?.profile?.name} />
                {dashboard?.nextPayment && (
                    <PayRentModal
                        payment={dashboard.nextPayment}
                        buildingWallet={activeLease?.unit?.building?.landlord?.walletAddress || ""}
                    />
                )}
            </div>
            <BriefInfo
                lease={activeLease}
                nextPayment={dashboard?.nextPayment}
                mutateDashboard={() => mutate("/api/tenant/dashboard")}
            />
            <div className="flex flex-col md:flex-row gap-4 w-full h-full items-center">
                <div className="w-full md:w-2/3 h-full">
                    <PropertyHeader
                        title={activeLease ? `${activeLease.unit?.unitNumber} - ${activeLease.unit?.building?.name}` : "No Active Lease"}
                        address={activeLease?.unit?.building?.address || "Please contact your landlord for an invite code."}
                        image="/property-view.jpg"
                        stats={[
                            { label: "BEDROOM", val: `${activeLease?.unit?.bedrooms || 0} Rooms` },
                            { label: "RENT", val: `${activeLease?.monthlyRent || 0} ${activeLease?.stablecoin || 'USDC'}` },
                            { label: "LEASE END", val: activeLease ? new Date(activeLease.endDate).toLocaleDateString() : "N/A" }
                        ]}
                        onOpenMaintenance={() => setIsMaintenanceOpen(true)}
                    />
                </div>
                <div className="w-full md:w-1/3 h-full flex items-center">
                    <BalanceCard />
                </div>
            </div>

            <MaintenanceModal
                isOpen={isMaintenanceOpen}
                onClose={() => setIsMaintenanceOpen(false)}
                buildingId={activeLease?.unit?.buildingId}
                unitId={activeLease?.unit?.id}
            />
            <div className="flex gap-2 w-full">
                <PaymentHistory payments={dashboard?.pastPayments} />
            </div>
        </div>
    );
}

const DashboardSkeleton = () => (
    <div className="flex flex-col gap-6 p-4 animate-pulse">
        <div className="h-10 bg-background-200 rounded-lg w-full" />
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <div className="h-4 bg-background-200 rounded w-24" />
                <div className="h-8 bg-background-200 rounded w-48" />
            </div>
            <div className="flex gap-2">
                <div className="h-10 bg-background-200 rounded w-24" />
                <div className="h-10 bg-background-200 rounded w-24" />
            </div>
        </div>
        <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[240px] h-32 bg-background-200 rounded-2xl" />
            ))}
        </div>
        <div className="h-64 bg-background-200 rounded-2xl w-full" />
    </div>
);