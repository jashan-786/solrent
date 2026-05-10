import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Card, CardHeader } from "@repo/ui/components/ui/card";

export const TransactionLedger = () => (
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
                    {[
                        { name: "Alex Rivera", prop: "Skyline Loft A4", amt: "2,450 USDC", init: "AR" },
                        { name: "Jordan Smith", prop: "Harbor Point 12", amt: "4,150 USDC", init: "JS" },
                    ].map((tx) => (
                        <TableRow key={tx.name} className="border-muted/20">
                            <TableCell className="flex items-center gap-3 py-4">
                                <Avatar className="h-8 w-8 border-background-grey">
                                    <AvatarFallback className="text-tiny font-bold bg-surface-secondary">{tx.init}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-bold text-auth-navy">{tx.name}</span>
                            </TableCell>
                            <TableCell className="text-sm text-text-grey">{tx.prop}</TableCell>
                            <TableCell className="text-sm font-bold text-auth-navy">{tx.amt}</TableCell>
                            <TableCell>
                                <div className="inline-flex text-tiny font-bold text-sol-emerald bg-sol-emerald/10 px-2 py-1 rounded">
                                    Settled
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </Card>
);