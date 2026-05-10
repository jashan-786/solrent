"use client";

import React from "react";
import { PaymentStats } from "@/components/landlord/payments/paymentstats";
import { PaymentFilters } from "@/components/landlord/payments/paymentfilters";
import { PaymentTable } from "@/components/landlord/payments/paymenttable";

export default function Payments() {
    return (
        <div className="w-full space-y-8 p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="space-y-1">
                <h1 className="text-3xl font-black text-auth-navy tracking-tight">Financial Ledger</h1>
                <p className="text-sm text-text-grey font-medium">Track on-chain settlements and rent distributions.</p>
            </header>

            <PaymentStats />

            <div className="space-y-4">
                <PaymentFilters />
                <PaymentTable />
            </div>
        </div>
    );
}