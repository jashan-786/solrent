import React from 'react';
import { Download, MoreVertical, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";

const PaymentTab = ({ payments, view }: { payments: any[], view: "upcoming" | "completed" | "receipts" }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const paginatedPayments = payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [view]);

    const handleExport = () => {
        if (!payments || payments.length === 0) {
            alert("No payments found to export.");
            return;
        }

        const headers = ["Period", "Due Date", "Amount", "Stablecoin", "Status", "Date Paid", "Transaction Hash", "NFT Mint"];
        
        const rows = payments.map((p: any) => {
            const period = new Date(p.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' });
            const dueDate = new Date(p.dueDate).toLocaleDateString();
            const paidAt = p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—';
            const status = p.status || 'N/A';
            const txHash = p.transactionHash || '—';
            const nftMint = p.nftReceiptMint || '—';
            
            return [
                `"${period}"`,
                dueDate,
                p.amount,
                p.stablecoin,
                status,
                paidAt,
                `"${txHash}"`,
                `"${nftMint}"`
            ];
        });

        // Add UTF-8 BOM for Excel compatibility
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `solrent_my_payments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (view === "receipts") {
        return (
            <div className="p-0 space-y-8 font-sans mt-6">
                <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-background-100">
                    <div className="p-8 bg-background-50/50 flex justify-between items-center border-b border-background-100">
                        <h2 className="text-2xl font-bold text-primary-900">On-Chain Receipts</h2>
                        <Button 
                            onClick={handleExport}
                            variant="ghost" 
                            className="text-secondary-600 hover:text-secondary-700 font-bold gap-2"
                        >
                            <Download className="w-4 h-4" /> Export History
                        </Button>
                    </div>
                    <div className="p-0">
                        <div className="grid grid-cols-5 px-8 py-4 bg-background-50/30 text-[10px] font-bold uppercase tracking-widest text-text-400">
                            <div>Period</div>
                            <div>Amount</div>
                            <div>Transaction Hash</div>
                            <div>Date Paid</div>
                            <div>NFT</div>
                        </div>
                        {paginatedPayments.length > 0 ? (
                            paginatedPayments.map((item) => (
                                <div key={item.id} className="grid grid-cols-5 px-8 py-6 items-center border-b border-background-50 last:border-0 hover:bg-background-50/20 transition-colors">
                                    <div className="font-bold text-primary-900">
                                        {new Date(item.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <div className="font-bold text-primary-900">
                                        {item.amount} {item.stablecoin}
                                    </div>
                                    <div>
                                        {item.transactionHash ? (
                                            <a
                                                href={`https://solscan.io/tx/${item.transactionHash}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-secondary-500 text-xs font-bold hover:underline"
                                            >
                                                {item.transactionHash.slice(0, 8)}...{item.transactionHash.slice(-4)}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-text-400 italic">N/A</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-text-500 font-medium">
                                        {item.paidAt ? new Date(item.paidAt).toLocaleDateString() : "—"}
                                    </div>
                                    <div>
                                        <Badge className={`text-[10px] font-bold px-3 py-1 rounded-lg border-none ${item.nftReceiptMint ? 'bg-amber-100 text-amber-700' : 'bg-background-100 text-text-400'}`}>
                                            {item.nftReceiptMint ? "MINTED" : "PENDING"}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-text-400 text-sm italic">No receipts available yet.</div>
                        )}
                    </div>
                </div>
                {totalPages > 1 && (
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </div>
        );
    }

    const isUpcoming = view === "upcoming";

    return (
        <div className="p-0 space-y-8 font-sans mt-6">
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-background-100">
                <div className="p-8 bg-background-50/50 flex justify-between items-center border-b border-background-100">
                    <h2 className="text-2xl font-bold text-primary-900">
                        {isUpcoming ? "Payment Schedule" : "Payment Journey Timeline"}
                    </h2>
                    <Button 
                        onClick={handleExport}
                        variant="ghost" 
                        className="text-secondary-600 hover:text-secondary-700 font-bold gap-2"
                    >
                        <Download className="w-4 h-4" /> Export History
                    </Button>
                </div>

                {isUpcoming ? (
                    <div className="p-0">
                        <div className="grid grid-cols-4 px-8 py-4 bg-background-50/30 text-[10px] font-bold uppercase tracking-widest text-text-400">
                            <div>Period</div>
                            <div>Amount</div>
                            <div>Type</div>
                            <div>Status</div>
                        </div>

                        {paginatedPayments.length > 0 ? (
                            paginatedPayments.map((item) => (
                                <div key={item.id} className="grid grid-cols-4 px-8 py-8 items-center border-b border-background-50 last:border-0 hover:bg-background-50/20 transition-colors">
                                    <div className="space-y-1">
                                        <div className="font-bold text-lg leading-tight text-primary-900">
                                            {new Date(item.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-text-400 font-medium">Due {new Date(item.dueDate).toLocaleDateString()}</div>
                                    </div>

                                    <div className="space-y-0.5">
                                        <div className="font-bold text-lg text-primary-900">{item.amount} {item.stablecoin}</div>
                                        <div className="text-xs text-text-400 font-medium">Verified Stablecoin</div>
                                    </div>

                                    <div>
                                        <Badge variant="secondary" className="bg-background-100 text-text-500 hover:bg-background-100 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
                                            RECURRING
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm font-bold text-text-500">
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'OVERDUE' ? 'bg-destructive' : 'bg-secondary-400'}`} />
                                            {item.status}
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-text-300 hover:text-primary-500"><MoreVertical className="w-5 h-5" /></Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-text-400 text-sm italic">No upcoming payments scheduled.</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-0 p-8">
                        {paginatedPayments.length > 0 ? (
                            paginatedPayments.map((step, idx, arr) => (
                                <div key={step.id} className="relative flex gap-6 pb-12 last:pb-0">
                                    {idx !== arr.length - 1 && (
                                        <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-background-100" />
                                    )}

                                    <div className="relative z-10 bg-white">
                                        <CheckCircle2 className="w-6 h-6 text-secondary-500 fill-secondary-50" />
                                    </div>

                                    <div className="flex-1 flex justify-between items-start pt-0.5">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-primary-900">
                                                {new Date(step.dueDate).toLocaleString('default', { month: 'long' })} Rent Payment
                                            </h4>
                                            <p className="text-sm text-text-400 font-medium">
                                                {step.transactionHash ? `Confirmed on Solana • ${step.transactionHash.slice(0, 8)}...` : 'Pending processing'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold tracking-wide uppercase text-secondary-600">
                                                NFT MINTED
                                            </div>
                                            {step.paidAt && <div className="text-[10px] font-bold text-text-300 mt-1 uppercase">{new Date(step.paidAt).toLocaleDateString()}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-text-400 text-sm italic py-4">No completed payments found.</div>
                        )}
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
        </div>
    );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) => (
    <div className="flex justify-center items-center gap-2 mt-8 bg-white p-4 rounded-2xl border border-background-100 shadow-sm w-fit mx-auto">
        <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-500 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
            Prev
        </button>
        <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                        ? "bg-secondary-500 text-white shadow-md shadow-secondary-500/20" 
                        : "text-text-400 hover:bg-background-50"
                    }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
        <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-500 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
            Next
        </button>
    </div>
);

export default PaymentTab;