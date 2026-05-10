"use client";

import React, { useState } from "react";
import { PaymentStats } from "@/components/landlord/payments/paymentstats";
import { PaymentFilters } from "@/components/landlord/payments/paymentfilters";
import { PaymentTable } from "@/components/landlord/payments/paymenttable";
import axios from "axios";
import useSWR from "swr";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentStatsData {
    success: boolean;
    payments: any[];
    totalVolume: number;
    pendingSettlements: number;
    failedTransfers: number;
    totalPaid: number;
    percentage: number;
    total: number;
}
export default function Payments() {
    const fetcher = (url: string) => axios.get(url).then((res: any) => res.data);
    const { data, error, isLoading }: { data: PaymentStatsData | null, error: any, isLoading: boolean } = useSWR("/api/landlord/payments", fetcher);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredPayments = data?.payments?.filter((payment: any) => {
        const matchesSearch = !search ||
            payment.transactionHash?.toLowerCase().includes(search.toLowerCase()) ||
            payment.lease?.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
            payment.lease?.tenant?.email?.toLowerCase().includes(search.toLowerCase()) ||
            payment.building?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil((filteredPayments?.length || 0) / itemsPerPage);
    const paginatedPayments = filteredPayments?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const handleExport = () => {
        if (!filteredPayments || filteredPayments.length === 0) {
            alert("No payments found to export.");
            return;
        }

        const headers = ["ID", "Tenant", "Email", "Building", "Amount", "Stablecoin", "Status", "Due Date", "Paid At", "TX Hash"];
        const rows = filteredPayments.map((p: any) => [
            p.id,
            `"${p.lease?.tenant?.name || 'N/A'}"`,
            p.lease?.tenant?.email || 'N/A',
            `"${p.building?.name || 'N/A'}"`,
            p.amount,
            p.stablecoin,
            p.status,
            p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A',
            p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A',
            p.transactionHash || 'N/A'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `solrent_payments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full space-y-8 p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="space-y-1">
                <h1 className="text-3xl font-black text-auth-navy tracking-tight">Financial Ledger</h1>
                <p className="text-sm text-text-grey font-medium">Track on-chain settlements and rent distributions.</p>
            </header>

            <PaymentStats data={data} isLoading={isLoading} />

            <div className="space-y-4">
                <PaymentFilters
                    search={search}
                    setSearch={setSearch}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onExport={handleExport}
                />
                <PaymentTable data={paginatedPayments || []} isLoading={isLoading} />

                {}
                {!isLoading && filteredPayments && filteredPayments.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 pb-10">
                        <p className="text-sm text-slate-400 font-bold">
                            Showing <span className="text-auth-navy font-black">{paginatedPayments?.length}</span> of <span className="text-auth-navy font-black">{filteredPayments.length}</span> records
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        className={`h-10 w-10 rounded-xl font-black transition-all ${currentPage === page ? 'bg-sol-indigo text-white shadow-md scale-110' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}