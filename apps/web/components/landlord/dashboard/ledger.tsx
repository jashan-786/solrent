"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Card, CardHeader } from "@repo/ui/components/ui/card";
import { ExternalLink } from "lucide-react";

export const TransactionLedger = ({ payments }: { payments: any[] }) => {
    return (
        <Card className="bg-white border border-background-100 shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <h3 className="text-primary-900 text-xl font-bold">Recent Transactions</h3>
                <a href="/landlord/payments" className="text-[10px] font-black text-sol-indigo hover:underline uppercase tracking-widest">
                    View Full Ledger
                </a>
            </CardHeader>
            <div className="overflow-x-auto p-2">
                <Table>
                    <TableHeader className="bg-background-50/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400 p-6">Tenant</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400 p-6">Property</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400 p-6">Amount</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-text-400 p-6 text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-text-400 text-sm italic">
                                    No transactions recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : payments.map((tx: any) => (
                            <TableRow key={tx.id} className="border-background-50 hover:bg-background-50/30 transition-colors">
                                <TableCell className="flex items-center gap-4 p-6">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarFallback className="text-xs font-black bg-secondary-50 text-secondary-600">
                                            {tx.lease?.tenant?.name?.slice(0, 2).toUpperCase() || "T"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-black text-primary-900 leading-none">{tx.lease?.tenant?.name}</p>
                                        <p className="text-[10px] text-text-400 mt-1">Verified Tenant</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-bold text-text-600 p-6">
                                    {tx.lease?.unit?.building?.name} <span className="text-text-400 ml-1">#{tx.lease?.unit?.unitNumber}</span>
                                </TableCell>
                                <TableCell className="text-sm font-black text-primary-900 p-6">
                                    {tx.amount?.toLocaleString() || "0"} <span className="text-[10px] text-text-400 font-black">{tx.stablecoin}</span>
                                </TableCell>
                                <TableCell className="p-6 text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`inline-flex text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                            tx.status === 'COMPLETED' ? 'text-secondary-600 bg-secondary-500/10' :
                                            tx.status === 'FAILED' ? 'text-destructive bg-destructive/10' :
                                            'text-text-400 bg-background-100'
                                        }`}>
                                            {tx.status}
                                        </div>
                                        {tx.transactionHash && (
                                            <a 
                                                href={`https://solscan.io/tx/${tx.transactionHash}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] text-sol-indigo hover:underline flex items-center gap-1 font-bold"
                                            >
                                                EXPLORER <ExternalLink size={10} />
                                            </a>
                                        )}
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