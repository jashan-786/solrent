"use client";

import React from "react";
import useSWR from "swr";
import axios from "axios";
import {
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash2,
    Mail,
    Loader2,
    Copy
} from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const getStatusBadge = (status: string) => {
    const styles = {
        ACTIVE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        EXPIRING: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        PENDING: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    };
    return styles[status as keyof typeof styles] || "bg-slate-100";
};

interface MainProps {
    search: string;
    buildingFilter: string;
    leaseStatusFilter: string;
    paymentStatusFilter: string;
}

export default function TenantTable({ search, buildingFilter, leaseStatusFilter, paymentStatusFilter }: MainProps) {
    const { data, isLoading } = useSWR("/api/landlord/tenants", fetcher);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, buildingFilter, leaseStatusFilter, paymentStatusFilter]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const allTenants = data?.tenants || [];

    const filteredTenants = allTenants.filter((tenant: any) => {
        const matchesSearch = !search ||
            tenant.name?.toLowerCase().includes(search.toLowerCase()) ||
            tenant.email?.toLowerCase().includes(search.toLowerCase()) ||
            tenant.building?.toLowerCase().includes(search.toLowerCase()) ||
            tenant.unit?.toString().toLowerCase().includes(search.toLowerCase()) ||
            tenant.walletAddress?.toLowerCase().includes(search.toLowerCase());

        const matchesBuilding = buildingFilter === "ALL" || tenant.buildingId === buildingFilter;
        const matchesLeaseStatus = leaseStatusFilter === "ALL" || tenant.leaseStatus === leaseStatusFilter;
        const matchesPaymentStatus = paymentStatusFilter === "ALL" || tenant.paymentStatus === paymentStatusFilter;

        return matchesSearch && matchesBuilding && matchesLeaseStatus && matchesPaymentStatus;
    });

    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const tenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500 p-8">
            <div className="rounded-[32px] border border-background-100 bg-white shadow-sm overflow-hidden">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-background-50/50">
                            <TableRow className="hover:bg-transparent border-b border-background-100">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-8 text-text-400">Tenant Name</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400">Building / Unit</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-text-400">Lease Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400">Payment Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400">Next Due</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-text-400">Wallet</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8 text-text-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20 text-text-400 italic">
                                        {allTenants.length === 0
                                            ? "No tenants registered yet. Use Invite Codes to onboard tenants."
                                            : "No tenants match the current filters."}
                                    </TableCell>
                                </TableRow>
                            ) : tenants.map((tenant: any) => (
                                <TableRow key={tenant.id} className="group hover:bg-background-50/30 transition-colors border-b border-background-50 last:border-0">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border border-background-100 shadow-sm">
                                                <AvatarImage src={tenant.img} />
                                                <AvatarFallback className="bg-secondary-50 text-secondary-600 font-black text-xs">
                                                    {tenant.name.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary-900 text-sm">{tenant.name}</span>
                                                <span className="text-xs text-text-400 font-medium">{tenant.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary-900 text-sm">{tenant.building}</span>
                                            <span className="text-xs text-text-400 font-black uppercase tracking-tighter mt-0.5">Unit {tenant.unit}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Badge className={`px-3 py-1 rounded-full text-[10px] font-black border-none ${getStatusBadge(tenant.leaseStatus)}`}>
                                            {tenant.leaseStatus}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${
                                                tenant.paymentStatus === "COMPLETED" ? "bg-secondary-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                                                tenant.paymentStatus === "FAILED" ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
                                                tenant.paymentStatus === "OVERDUE" ? "bg-red-500 animate-pulse" :
                                                "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                            }`} />
                                            <span className="text-sm font-black text-primary-900">
                                                {tenant.paymentStatus === "COMPLETED" ? "Paid" : 
                                                 tenant.paymentStatus === "FAILED" ? "Failed" : 
                                                 tenant.paymentStatus === "OVERDUE" ? "Overdue" : "Pending"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm font-bold text-primary-900">
                                            {tenant.nextDue}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-center font-mono text-xs">
                                        {tenant.walletAddress ? (
                                            <div className="flex items-center justify-center gap-2 text-secondary-600 font-bold">
                                                <span>{tenant.walletAddress.slice(0, 4)}...{tenant.walletAddress.slice(-4)}</span>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(tenant.walletAddress)}
                                                    className="p-1 hover:bg-secondary-50 rounded transition-colors"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-text-300 italic">Not Connected</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right px-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-background-100 transition-colors"
                                                >
                                                    <MoreVertical className="h-4 w-4 text-text-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-background-100 p-2">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-text-400 px-3 py-2">Management</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl py-2.5 font-bold text-sm">
                                                    <Eye className="h-4 w-4 text-text-400" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl py-2.5 font-bold text-sm">
                                                    <Mail className="h-4 w-4 text-text-400" /> Send Message
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl py-2.5 font-bold text-sm">
                                                    <Pencil className="h-4 w-4 text-text-400" /> Edit Lease
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-background-50" />
                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl py-2.5 font-bold text-sm text-destructive focus:text-destructive">
                                                    <Trash2 className="h-4 w-4" /> Terminate Lease
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 pb-20">
                <p className="text-sm text-text-400 font-bold">
                    Showing <span className="text-primary-900 font-black">{tenants.length}</span> of <span className="text-primary-900 font-black">{filteredTenants.length}</span> tenants
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