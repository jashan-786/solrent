"use client";

import React from "react";
import useSWR from "swr";
import axios from "axios";
import {
    MoreVertical,
    ExternalLink,
    FileText,
    RefreshCcw,
    History,
    Trash2,
    AlertTriangle,
    TrendingUp,
    Loader2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@repo/ui/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const getStatusStyles = (status: string) => {
    switch (status) {
        case "ACTIVE": return "bg-secondary-500/10 text-secondary-500 border-secondary-500/20";
        case "EXPIRING": return "bg-orange-50 text-orange-600 border-orange-100";
        case "PENDING": return "bg-background-50 text-text-400 border-background-100";
        case "TERMINATION_REQUESTED": return "bg-orange-50 text-orange-600 border-orange-100";
        case "TERMINATED": return "bg-background-50 text-text-400 border-background-100";
        default: return "bg-destructive/10 text-destructive border-destructive/10";
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "PENDING":
            return "Awaiting Tenant Approval";
        case "TERMINATION_REQUESTED":
            return "Termination Awaiting Tenant";
        default:
            return status.replaceAll("_", " ");
    }
};

interface LeasesTableProps {
    search: string;
    buildingFilter: string;
    leaseStatusFilter: string;
}

export default function LeasesTable({ search, buildingFilter, leaseStatusFilter }: LeasesTableProps) {
    const { data, isLoading, mutate } = useSWR("/api/landlord/leases", fetcher);
    const router = useRouter();
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, buildingFilter, leaseStatusFilter]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const allLeases = data?.leases || [];

    const filteredLeases = allLeases.filter((lease: any) => {
        const matchesSearch = !search ||
            lease.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
            lease.email?.toLowerCase().includes(search.toLowerCase()) ||
            lease.building?.toLowerCase().includes(search.toLowerCase()) ||
            lease.unit?.toString().toLowerCase().includes(search.toLowerCase()) ||
            lease.transactionHash?.toLowerCase().includes(search.toLowerCase());

        const matchesLeaseStatus = leaseStatusFilter === "ALL" || lease.status === leaseStatusFilter;
        const matchesBuilding = buildingFilter === "ALL" || lease.buildingId === buildingFilter;

        return matchesSearch && matchesLeaseStatus && matchesBuilding;
    });

    const totalPages = Math.ceil(filteredLeases.length / itemsPerPage);
    const leases = filteredLeases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        
            <div className="w-full space-y-4 p-8">
                <div className="rounded-[32px] border border-background-100 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-background-50/50">
                            <TableRow className="border-b border-background-100">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] py-6 text-text-400 px-8">Lease / Tenant</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-400">Building & Unit</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-400 text-center">Contract Period</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-400">Monthly Rent</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-400">Settlement</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-400 text-right px-8">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-text-400 italic">
                                        {allLeases.length === 0
                                            ? "No active leases found."
                                            : "No leases match the current filters."}
                                    </TableCell>
                                </TableRow>
                            ) : leases.map((lease: any) => (
                            <TableRow key={lease.id} className="group hover:bg-background-50/30 transition-colors border-b border-background-50 last:border-0">
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-primary-900 text-white text-[10px] font-black">
                                                    {lease.tenantName?.slice(0, 2).toUpperCase() || "T"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                                                <div className={`h-2.5 w-2.5 rounded-full border-2 border-white ${lease.status === 'ACTIVE' ? 'bg-secondary-500' : 'bg-orange-400'}`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-primary-900 text-sm">{lease.tenantName}</span>
                                                <Badge variant="outline" className={`text-[9px] h-4 uppercase px-1.5 font-black tracking-widest ${getStatusStyles(lease.status)}`}>
                                                    ID-{lease.id.slice(0, 4)}
                                                </Badge>
                                            </div>
                                            <div className="mt-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] uppercase px-1.5 py-0.5 font-black tracking-widest ${getStatusStyles(lease.status)}`}
                                                >
                                                    {getStatusLabel(lease.status)}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-text-400 font-medium">{lease.email}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-primary-900 text-sm">{lease.building}</span>
                                        <span className="text-xs text-secondary-500 font-black uppercase tracking-widest mt-0.5">
                                            Unit {lease.unit}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-primary-900">
                                            <span className="text-xs font-black">{lease.startDate}</span>
                                            <div className="h-[2px] w-3 bg-background-200 rounded-full" />
                                            <span className="text-xs font-black">{lease.endDate}</span>
                                        </div>
                                        {!lease.isOnChain && (
                                            <div className="flex items-center gap-1.5 mt-2 bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20 w-fit">
                                                <XCircle className="h-2.5 w-2.5 text-destructive" />
                                                <span className="text-[9px] uppercase tracking-widest text-destructive font-black">Off-Chain / Fake</span>
                                            </div>
                                        )}
                                        {lease.isOnChain && <span className="text-[9px] uppercase tracking-widest text-text-400 font-black mt-1.5 opacity-60">Verified Term</span>}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black text-primary-900">
                                                {lease.monthlyRent.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-black text-text-300 uppercase">{lease.currency}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-secondary-500 font-black uppercase tracking-widest mt-0.5">
                                            <TrendingUp className="h-2.5 w-2.5" />
                                            Market Rate
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <code className="text-[10px] font-mono bg-background-50 px-2 py-1 rounded-lg text-text-400 border border-background-100" title={lease.onChainAddress ? "Lease Account PDA" : "Tenant Wallet"}>
                                                {lease.onChainAddress 
                                                    ? `${lease.onChainAddress.slice(0, 4)}...${lease.onChainAddress.slice(-4)}` 
                                                    : (lease.walletAddress !== "N/A" 
                                                        ? `${lease.walletAddress.slice(0, 4)}...${lease.walletAddress.slice(-4)}` 
                                                        : "N/A")}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-text-300 hover:text-secondary-500"
                                                onClick={() => {
                                                    const addr = lease.onChainAddress || lease.walletAddress;
                                                    if (addr && addr !== "N/A") {
                                                        window.open(`https://solscan.io/account/${addr}?cluster=devnet`, "_blank");
                                                    }
                                                }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        {lease.transactionHash && (
                                            <div className="flex items-center gap-2">
                                                <code className="text-[9px] font-mono bg-sol-indigo/5 px-2 py-1 rounded-lg text-sol-indigo border border-sol-indigo/10" title="Transaction Hash">
                                                    {lease.transactionHash.slice(0, 8)}...
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sol-indigo hover:text-sol-indigo hover:bg-sol-indigo/10"
                                                    onClick={() => window.open(`https://solscan.io/tx/${lease.transactionHash}?cluster=devnet`, "_blank")}
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right px-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-background-50">
                                                <MoreVertical className="h-4 w-4 text-text-300" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-60 rounded-2xl shadow-xl border-background-100 p-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-text-400 px-3 py-2">Lease Management</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => window.open(`/api/leases/${lease.id}/document-url`, "_blank")}
                                                className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                                            >
                                                <FileText className="h-4 w-4 text-primary-900" />
                                                View Agreement
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => alert("Lease renewal feature is coming soon!")}
                                                className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                                            >
                                                <RefreshCcw className="h-4 w-4 text-secondary-500" />
                                                Renew Lease
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.push('/landlord/payments')}
                                                className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                                            >
                                                <History className="h-4 w-4 text-text-400" />
                                                Payment Ledger
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-background-50" />
                                            {lease.status === "TERMINATED" ? (
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        if (confirm("This will permanently remove this lease from the database. Continue?")) {
                                                            try {
                                                                await axios.delete(`/api/landlord/leases?id=${lease.id}`);
                                                                mutate();
                                                            } catch (e: any) {
                                                                alert(e?.response?.data?.message || "Failed to delete lease.");
                                                            }
                                                        }
                                                    }}
                                                    className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm text-destructive focus:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Lease
                                                </DropdownMenuItem>
                                            ) : lease.status === "TERMINATION_REQUESTED" ? (
                                                <DropdownMenuItem
                                                    onClick={() => alert("Termination is pending tenant approval.")}
                                                    className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm opacity-60"
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Awaiting Tenant Approval
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        if (confirm("Request termination from the tenant? They must approve before you can delete this lease.")) {
                                                            try {
                                                                await axios.post("/api/landlord/leases/request-termination", { leaseId: lease.id });
                                                                mutate();
                                                            } catch (e: any) {
                                                                alert(e?.response?.data?.message || "Failed to request termination.");
                                                            }
                                                        }
                                                    }}
                                                    className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm text-orange-700 hover:bg-orange-50"
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Request Termination
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 pb-20">
                <p className="text-sm text-text-400 font-bold">
                    Showing <span className="text-primary-900 font-black">{leases.length}</span> of <span className="text-primary-900 font-black">{filteredLeases.length}</span> leases
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-xl border-background-100 font-bold hover:bg-background-50 disabled:opacity-50"
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
                                className={`h-10 w-10 rounded-xl font-black transition-all ${currentPage === page ? 'bg-primary-900 text-white shadow-md scale-110' : 'bg-background-50 text-primary-900 hover:bg-background-100'}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-xl border-background-100 font-bold hover:bg-background-50 disabled:opacity-50"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}