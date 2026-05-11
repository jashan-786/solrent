"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { CheckCircle2, AlertCircle, Clock, ExternalLink, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

const getStatusBadge = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return { className: "bg-sol-emerald/10 text-sol-emerald", icon: <CheckCircle2 className="h-3 w-3 mr-1.5" />, label: "CONFIRMED" };
        case "UPCOMING":
            return { className: "bg-amber-100 text-amber-600", icon: <Clock className="h-3 w-3 mr-1.5" />, label: "PENDING" };
        case "FAILED":
            return { className: "bg-red-100 text-red-600", icon: <AlertCircle className="h-3 w-3 mr-1.5" />, label: "FAILED" };
        case "OVERDUE":
            return { className: "bg-orange-100 text-orange-600", icon: <AlertCircle className="h-3 w-3 mr-1.5" />, label: "OVERDUE" };
        default:
            return { className: "bg-slate-100 text-slate-600", icon: <Clock className="h-3 w-3 mr-1.5" />, label: status };
    }
};

export function PaymentTable({ data, isLoading }: { data: any[], isLoading: boolean }) {

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[30vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    return (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] py-5 px-6">TX ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">Tenant / Unit</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">Amount</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">On-Chain Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">Date</TableHead>
                        <TableHead className="text-right px-6">...</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(!data || data.length === 0) ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-20 text-text-400 italic">
                                No payments found.
                            </TableCell>
                        </TableRow>
                    ) : data.map((payment: any) => (
                        <PaymentRow key={payment.id} payment={payment} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PaymentRow({ payment }: { payment: any }) {
    const statusBadge = getStatusBadge(payment.status);
    const txHash = payment.transactionHash;
    const shortHash = txHash ? `${txHash.slice(0, 4)}...${txHash.slice(-4)}` : "N/A";
    const tenantName = payment.lease?.tenant?.name || "Unknown";
    const buildingName = payment.building?.name || "—";

    return (
        <TableRow className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell className="py-5 px-6">
                <div className="flex flex-col">
                    <span className="font-bold text-auth-navy text-sm">TX-{payment.id.slice(0, 4)}</span>
                    <a
                        href={txHash ? `https://explorer.solana.com/tx/${txHash}?cluster=devnet` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 group cursor-pointer"
                    >
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-sol-indigo underline decoration-dotted">{shortHash}</span>
                        {txHash && <ExternalLink className="h-2.5 w-2.5 text-slate-300 group-hover:text-sol-indigo" />}
                    </a>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-bold text-auth-slate text-sm">{tenantName}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sol-indigo uppercase tracking-tighter">{buildingName}</span>
                        <span className="text-[10px] text-slate-400 font-medium lowercase">• {payment.lease?.tenant?.email}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                        {payment.stablecoin?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-auth-navy text-sm">{payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] font-bold text-slate-400">{payment.stablecoin || "USDC"}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge className={`${statusBadge.className} border-none rounded-lg px-3 py-1 text-[10px] font-black`}>
                    {statusBadge.icon} {statusBadge.label}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="text-xs font-bold text-auth-slate">
                    {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "N/A"}
                </span>
            </TableCell>
            <TableCell className="text-right px-8">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-100 p-2">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Transaction Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => {
                                if (txHash) window.open(`https://solscan.io/tx/${txHash}?cluster=devnet`, "_blank");
                            }}
                            disabled={!txHash}
                            className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                        >
                            <ExternalLink className="h-4 w-4 text-sol-indigo" />
                            View on Explorer
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={() => {
                                if (txHash) {
                                    navigator.clipboard.writeText(txHash);
                                    alert("Transaction hash copied!");
                                }
                            }}
                            disabled={!txHash}
                            className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                        >
                            <CheckCircle2 className="h-4 w-4 text-sol-emerald" />
                            Copy TX ID
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-slate-50" />
                        
                        <DropdownMenuItem 
                            onClick={() => window.location.href = `mailto:${payment.lease?.tenant?.email || ''}`}
                            className="gap-3 rounded-xl cursor-pointer py-3 font-bold text-sm"
                        >
                            <AlertCircle className="h-4 w-4 text-slate-400" />
                            Contact Tenant
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}