"use client";

import React from "react";
import {
    MoreVertical,
    ExternalLink,
    Calendar,
    DollarSign,
    RefreshCcw,
    FileText,
    History,
    Trash2,
    ChevronLeft,
    ChevronRight,
    TrendingUp
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

// --- Types ---
interface Lease {
    id: string;
    tenantName: string;
    email: string;
    unit: string;
    building: string;
    monthlyRent: number;
    currency: "USDC" | "PYUSD";
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "EXPIRING" | "PENDING" | "TERMINATED";
    walletAddress: string;
}

const leases: Lease[] = [
    {
        id: "L-101",
        tenantName: "Marcus Thorne",
        email: "marcus.t@web3mail.com",
        unit: "1402",
        building: "Azure Heights",
        monthlyRent: 2450,
        currency: "USDC",
        startDate: "Oct 01, 2023",
        endDate: "Sep 30, 2024",
        status: "ACTIVE",
        walletAddress: "7xKX...Zp4n"
    },
    {
        id: "L-102",
        tenantName: "Sarah Jenkins",
        email: "s.jenkins@meta.com",
        unit: "405",
        building: "The Meridian",
        monthlyRent: 1800,
        currency: "PYUSD",
        startDate: "Jan 15, 2023",
        endDate: "Jan 14, 2024",
        status: "EXPIRING",
        walletAddress: "As2w...m9qR"
    }
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case "ACTIVE": return "bg-sol-emerald/10 text-sol-emerald border-sol-emerald/20";
        case "EXPIRING": return "bg-orange-50 text-orange-600 border-orange-100";
        case "PENDING": return "bg-slate-100 text-slate-500 border-slate-200";
        default: return "bg-red-50 text-red-600 border-red-100";
    }
};

export default function LeasesTable() {
    return (
        <div className="w-full space-y-4 p-8">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-100">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] py-5 text-text-grey px-6">Lease / Tenant</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-grey">Building & Unit</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-grey text-center">Contract Period</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-grey">Monthly Rent</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-grey">Settlement</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] text-text-grey text-right px-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leases.map((lease) => (
                            <TableRow key={lease.id} className="group hover:bg-surface-secondary/30 transition-colors border-b border-slate-50">
                                {/* Lease & Tenant Info */}
                                <TableCell className="py-5 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-auth-navy text-white text-xs font-bold">
                                                    {lease.tenantName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                                                <div className={`h-2.5 w-2.5 rounded-full border-2 border-white ${lease.status === 'ACTIVE' ? 'bg-sol-emerald' : 'bg-orange-400'}`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-auth-navy text-sm">{lease.tenantName}</span>
                                                <Badge variant="outline" className={`text-[9px] h-4 uppercase px-1.5 ${getStatusStyles(lease.status)}`}>
                                                    {lease.id}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-text-grey font-medium">{lease.email}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Property Info */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-auth-slate text-sm">{lease.building}</span>
                                        <span className="text-xs text-sol-indigo font-bold flex items-center gap-1">
                                            Unit {lease.unit}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Contract Period */}
                                <TableCell>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-auth-slate">
                                            <span className="text-xs font-bold">{lease.startDate}</span>
                                            <div className="h-px w-3 bg-slate-300" />
                                            <span className="text-xs font-bold">{lease.endDate}</span>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-tighter text-text-grey font-black mt-1">12 Month Term</span>
                                    </div>
                                </TableCell>

                                {/* Financials */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-black text-auth-navy">
                                                {lease.monthlyRent.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">{lease.currency}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-sol-emerald font-bold">
                                            <TrendingUp className="h-2.5 w-2.5" />
                                            Market Rate
                                        </div>
                                    </div>
                                </TableCell>

                                {/* On-Chain Settlement */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                            {lease.walletAddress}
                                        </code>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>

                                {/* Refined Actions */}
                                <TableCell className="text-right px-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                                <MoreVertical className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-100 p-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-text-grey px-2 py-2">Lease Management</DropdownMenuLabel>
                                            <DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5">
                                                <FileText className="h-4 w-4 text-sol-indigo" />
                                                <span className="font-bold text-sm">View Agreement</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5">
                                                <RefreshCcw className="h-4 w-4 text-sol-emerald" />
                                                <span className="font-bold text-sm">Renew Lease</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5">
                                                <History className="h-4 w-4 text-slate-400" />
                                                <span className="font-bold text-sm">Payment Ledger</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-1 bg-slate-50" />
                                            <DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="font-bold text-sm">Notice of Termination</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Reuse your existing Pagination component here */}
        </div>
    );
}