"use client";

import React from "react";
import {
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash2,
    Mail
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

// --- Types & Mock Data ---

interface Tenant {
    id: string;
    name: string;
    email: string;
    img?: string;
    building: string;
    unit: string;
    leaseStatus: "ACTIVE" | "EXPIRING" | "PENDING";
    paymentStatus: "Paid" | "Pending" | "Failed";
    nextDue: string;
    wallet: boolean;
    urgent?: boolean;
}

const tenants: Tenant[] = [
    {
        id: "1",
        name: "Marcus Thorne",
        email: "marcus.t@web3mail.com",
        building: "Azure Heights",
        unit: "Unit 1402 • Penthouse",
        leaseStatus: "ACTIVE",
        paymentStatus: "Paid",
        nextDue: "Oct 01, 2023",
        wallet: true,
    },
    {
        id: "2",
        name: "Sarah Jenkins",
        email: "s.jenkins@meta.com",
        building: "The Meridian",
        unit: "Unit 405 • Studio",
        leaseStatus: "EXPIRING",
        paymentStatus: "Pending",
        nextDue: "Sep 15, 2023",
        wallet: true,
        urgent: true,
    },
    {
        id: "3",
        name: "Elena Lopez",
        email: "elena@web3.io",
        building: "Emerald Plaza",
        unit: "Unit 201 • 2BR",
        leaseStatus: "PENDING",
        paymentStatus: "Failed",
        nextDue: "Oct 05, 2023",
        wallet: false,
    },
    {
        id: "4",
        name: "David Chen",
        email: "d.chen@sol.io",
        building: "Azure Heights",
        unit: "Unit 1102 • 1BR",
        leaseStatus: "ACTIVE",
        paymentStatus: "Paid",
        nextDue: "Sep 28, 2023",
        wallet: true,
    },
];

// --- Helper Functions ---

const getStatusBadge = (status: string) => {
    const styles = {
        ACTIVE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        EXPIRING: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        PENDING: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    };
    return styles[status as keyof typeof styles] || "bg-slate-100";
};

// --- Main Component ---

export default function TenantTable() {
    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500 p-8">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider py-4 text-auth-slate">Tenant Name</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-auth-slate">Building / Unit</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-center text-auth-slate">Lease Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-auth-slate">Payment Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-auth-slate">Next Due</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-center text-auth-slate">Wallet</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right px-6 text-auth-slate">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                                <AvatarImage src={tenant.img} />
                                                <AvatarFallback className="bg-surface-secondary text-auth-navy font-bold">
                                                    {tenant.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-auth-navy text-sm">{tenant.name}</span>
                                                <span className="text-xs text-text-grey">{tenant.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-auth-slate text-sm">{tenant.building}</span>
                                            <span className="text-xs text-text-grey font-medium">{tenant.unit}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Badge className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border-none ${getStatusBadge(tenant.leaseStatus)}`}>
                                            {tenant.leaseStatus}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${tenant.paymentStatus === "Paid" ? "bg-sol-emerald" :
                                                tenant.paymentStatus === "Failed" ? "bg-destructive" : "bg-slate-400"
                                                }`} />
                                            <span className="text-sm font-semibold text-auth-slate">{tenant.paymentStatus}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className={`text-sm font-semibold ${tenant.urgent ? "text-destructive" : "text-auth-slate"}`}>
                                            {tenant.nextDue}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        {tenant.wallet ? (
                                            <CheckCircle2 className="h-5 w-5 text-sol-emerald mx-auto" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right px-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full hover:bg-slate-100 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                                                <DropdownMenuLabel className="text-xs text-text-grey">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                                    <Eye className="h-4 w-4" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                                    <Mail className="h-4 w-4" /> Send Message
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                                    <Pencil className="h-4 w-4" /> Edit Lease
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
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

                {/* Mobile View (Card-based) */}
                <div className="md:hidden grid grid-cols-1 gap-0 divide-y divide-slate-100">
                    {tenants.map((tenant) => (
                        <div key={tenant.id} className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-slate-100">
                                        <AvatarImage src={tenant.img} />
                                        <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-auth-navy">{tenant.name}</p>
                                        <p className="text-xs text-text-grey">{tenant.email}</p>
                                    </div>
                                </div>
                                <Badge className={`text-[10px] ${getStatusBadge(tenant.leaseStatus)}`}>
                                    {tenant.leaseStatus}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-text-grey mb-1">Building</p>
                                    <p className="font-semibold">{tenant.building}</p>
                                    <p className="text-xs text-text-grey">{tenant.unit}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-text-grey mb-1">Next Due</p>
                                    <p className={`font-semibold ${tenant.urgent ? "text-destructive" : ""}`}>{tenant.nextDue}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2 pb-10">
                <p className="text-sm text-text-grey font-medium order-2 sm:order-1">
                    Showing <span className="text-auth-navy font-bold">1-10</span> of <span className="text-auth-navy font-bold">142</span> tenants
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button variant="outline" size="sm" className="h-9 gap-1 rounded-xl border-slate-200 hover:bg-slate-50">
                        <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button size="sm" className="h-9 w-9 rounded-xl bg-auth-navy text-white hover:bg-auth-slate shadow-sm">1</Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl hover:bg-surface-secondary">2</Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl hover:bg-surface-secondary">3</Button>
                        <span className="px-2 text-text-grey">...</span>
                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl hover:bg-surface-secondary">15</Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-1 rounded-xl border-slate-200 hover:bg-slate-50">
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}