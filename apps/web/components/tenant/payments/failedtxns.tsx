import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";

export default function FailedTxns({ payments }: { payments: any[] }) {
    if (!payments || payments.length === 0) {
        return (
            <div className="mt-6 bg-white rounded-[32px] border border-background-100 p-16 text-center shadow-sm">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-secondary-50 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-secondary-500" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-primary-900 mb-1">No Failed Payments</h3>
                <p className="text-text-400 text-sm">All your transactions have been processed successfully.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
            {payments.map((item) => (
                <PaymentErrorAlert key={item.id} payment={item} />
            ))}
        </div>
    );
}

const PaymentErrorAlert = ({ payment }: { payment: any }) => {
    const month = new Date(payment.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="w-full flex justify-center">
            <div className="max-w-4xl w-full bg-destructive/10 border border-destructive/20 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive fill-destructive/10" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-text-900 font-bold text-lg leading-tight">
                            Payment Failed: {month} Rent
                        </h3>
                        <p className="text-text-500 text-sm font-medium">
                            {payment.failureReason || "Reason: Transaction rejected or insufficient balance."}
                        </p>
                        <p className="text-[10px] text-text-400 font-bold uppercase tracking-wider mt-1">
                            Amount: {payment.amount} {payment.stablecoin} • Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        className="flex-1 md:flex-none bg-destructive hover:bg-destructive/90 text-white font-bold px-8 py-6 rounded-xl text-md transition-colors gap-2"
                    >
                        <RefreshCw className="h-4 w-4" /> Retry Payment
                    </Button>
                </div>
            </div>
        </div>
    );
};
