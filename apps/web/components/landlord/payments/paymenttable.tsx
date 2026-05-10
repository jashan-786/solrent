import { Badge } from "@repo/ui/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { CheckCircle2, AlertCircle, Clock, ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export function PaymentTable() {
    // Use the transactions data array here
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
                    {/* Map through transactions here */}
                    <PaymentRow />
                </TableBody>
            </Table>
        </div>
    );
}

function PaymentRow() {
    return (
        <TableRow className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
            <TableCell className="py-5 px-6">
                <div className="flex flex-col">
                    <span className="font-bold text-auth-navy text-sm">TX-9021</span>
                    <div className="flex items-center gap-1 group cursor-pointer">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-sol-indigo underline decoration-dotted">5fGz...3n9q</span>
                        <ExternalLink className="h-2.5 w-2.5 text-slate-300 group-hover:text-sol-indigo" />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-bold text-auth-slate text-sm">Marcus Thorne</span>
                    <span className="text-[10px] font-bold text-sol-indigo uppercase tracking-tighter">Unit 1402</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">U</div>
                    <div className="flex flex-col">
                        <span className="font-black text-auth-navy text-sm">2,450.00</span>
                        <span className="text-[10px] font-bold text-slate-400">USDC</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge className="bg-sol-emerald/10 text-sol-emerald border-none rounded-lg px-3 py-1 text-[10px] font-black">
                    <CheckCircle2 className="h-3 w-3 mr-1.5" /> CONFIRMED
                </Badge>
            </TableCell>
            <TableCell>
                <span className="text-xs font-bold text-auth-slate">Apr 01, 2026</span>
            </TableCell>
            <TableCell className="text-right px-6">
                <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
            </TableCell>
        </TableRow>
    );
}