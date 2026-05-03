"use client";

import useSWR from "swr";
import axios from "axios";
import TenantDashboardTopbar from "@/components/tenant/dashboard/topbar";
import TenantIntro from "@/components/tenant/dashboard/tenantintro";
import BriefInfo from "@/components/tenant/dashboard/briefinfo";
import PropertyHeader from "@/components/tenant/dashboard/propertyheader";
import { BalanceCard } from "@/components/tenant/dashboard/walletbalancecard";
import PaymentHistory from "@/components/tenant/dashboard/paymenthistory";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function TenantDashboardPage() {
    const { data, isLoading } = useSWR("/api/tenant/dashboard", fetcher);

    if (isLoading) return <DashboardSkeleton />;

    const dashboard = data?.dashboard;
    const activeLease = dashboard?.activeLease;

    return (
        <div className="flex flex-col gap-4 p-4">
            <TenantDashboardTopbar />
            <TenantIntro name={dashboard?.profile?.name} />
            <BriefInfo lease={activeLease} />
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
                    />
                </div>
                <div className="w-full md:w-1/3 h-full flex items-center">
                    <BalanceCard />
                </div>
            </div>
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