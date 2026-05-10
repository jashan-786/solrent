"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import PaymentTab from "@/components/tenant/payments/paymenttab";
import { StatsOverview } from "@/components/tenant/payments/stats";
import Tabs from "@/components/tenant/payments/tabs";
import PaymentHeader from "@/components/tenant/payments/paymentheader";
import FailedTxns from "@/components/tenant/payments/failedtxns";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Payments() {
    const { data, isLoading } = useSWR("/api/tenant/leases", fetcher);
    const [activeTab, setActiveTab] = useState("Upcoming");

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const leases = data?.leases || [];

    const allPayments = leases.flatMap((l: any) => l.payments || []);

    const upcomingPayments = allPayments.filter((p: any) => p.status === 'UPCOMING' || p.status === 'OVERDUE');
    const completedPayments = allPayments.filter((p: any) => p.status === 'COMPLETED');
    const failedPayments = allPayments.filter((p: any) => p.status === 'FAILED');

    return (
        <div className="bg-background-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <PaymentHeader />
                <StatsOverview payments={allPayments} />
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === "Upcoming" && (
                    <PaymentTab payments={upcomingPayments} view="upcoming" />
                )}
                {activeTab === "Completed" && (
                    <PaymentTab payments={completedPayments} view="completed" />
                )}
                {activeTab === "Failed" && (
                    <FailedTxns payments={failedPayments} />
                )}
                {activeTab === "Receipts / NFTs" && (
                    <PaymentTab payments={completedPayments} view="receipts" />
                )}
            </div>
        </div>
    );
}