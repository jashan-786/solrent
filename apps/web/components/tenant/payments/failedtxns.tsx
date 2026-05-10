import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";

interface FailedTxnsProps {
    id: number;
    period: string;
    amount: string;
    usd: string;
    status: string;
    action: string;
}

export default function FailedTxns() {
    const failedTxns: FailedTxnsProps[] = [
        {
            id: 1,
            period: "November 2023",
            amount: "45.00",
            usd: "2,840.50",
            status: "Failed",
            action: "Retry"
        },
        {
            id: 2,
            period: "December 2023",
            amount: "45.00",
            usd: "2,840.50",
            status: "Failed",
            action: "Retry"
        },
        {
            id: 3,
            period: "January 2024",
            amount: "45.00",
            usd: "2,840.50",
            status: "Failed",
            action: "Retry"
        }
    ]
    return (
        <div>
            {
                failedTxns.map((item) => {
                    return (
                        <PaymentErrorAlert />
                    )
                })
            }
        </div>

    )

}

const PaymentErrorAlert = () => {
    return (
        <div className="w-full flex justify-center p-4">
            {/* Main Alert Container */}
            <div className="max-w-4xl w-full bg-[#fdf2f2] border border-[#fde8e8] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

                {/* Left Section: Icon and Text */}
                <div className="flex items-center gap-5">
                    {/* Circular Alert Icon Container */}
                    <div className="flex-shrink-0 w-12 h-12 bg-[#fde8e8] rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#b91c1c] fill-[#b91c1c]/10" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-[#1a1c1e] font-bold text-lg leading-tight">
                            Payment Failed: November Rent
                        </h3>
                        <p className="text-[#6b7280] text-sm font-medium">
                            Reason: Insufficient SOL balance in connected wallet (x82...3f).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        className="flex-1 md:flex-none bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold px-8 py-6 rounded-xl text-md transition-colors"
                    >
                        Retry Payment
                    </Button>


                </div>

            </div>
        </div>
    );
};
