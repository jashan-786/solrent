"use client";

import useSWR from "swr";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Card, CardHeader } from "@repo/ui/components/ui/card";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const TransactionLedger = () => {
    const { data, isLoading } = useSWR("/api/landlord/dashboard", fetcher);

    const payments = data?.recentPayments || [];

    return (
        <Card className="bg-card border-none shadow-sm overflow-hidden">
            <CardHeader>
                <h5 className="text-auth-navy">Recent Transactions</h5>
            </CardHeader>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-surface-secondary/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-tiny font-bold uppercase tracking-wider">Tenant</TableHead>
                            <TableHead className="text-tiny font-bold uppercase tracking-wider">Property</TableHead>
                            <TableHead className="text-tiny font-bold uppercase tracking-wider">Amount</TableHead>
                            <TableHead className="text-tiny font-bold uppercase tracking-wider">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    <div className="animate-pulse text-text-400 font-bold uppercase tracking-widest text-[10px]">
                                        Loading ledger...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-text-400 text-sm">
                                    No transactions recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : payments.map((tx: any) => (
                            <TableRow key={tx.id} className="border-muted/20">
                                <TableCell className="flex items-center gap-3 py-4">
                                    <Avatar className="h-8 w-8 border-background-grey">
                                        <AvatarFallback className="text-tiny font-bold bg-surface-secondary text-primary-900">
                                            {tx.lease?.tenant?.name?.slice(0, 2).toUpperCase() || "T"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-bold text-auth-navy">{tx.lease?.tenant?.name}</span>
                                </TableCell>
                                <TableCell className="text-sm text-text-grey">
                                    {tx.lease?.unit?.building?.name} ({tx.lease?.unit?.unitNumber})
                                </TableCell>
                                <TableCell className="text-sm font-bold text-auth-navy">
                                    {tx.amount.toLocaleString()} {tx.stablecoin}
                                </TableCell>
                                <TableCell>
                                    <div className={`inline-flex text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${
                                        tx.status === 'COMPLETED' ? 'text-secondary-500 bg-secondary-500/10' :
                                        tx.status === 'FAILED' ? 'text-destructive bg-destructive/10' :
                                        'text-text-400 bg-background-100'
                                    }`}>
                                        {tx.status}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};