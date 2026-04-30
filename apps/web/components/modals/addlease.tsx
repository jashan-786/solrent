
"use client";

import React from "react";
import { useForm } from "@tanstack/react-form";
import {
    Building2, User, Calendar, DollarSign,
    Wallet, ShieldCheck, Zap, Info,
    Plus
} from "lucide-react";

import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Switch } from "@repo/ui/components/ui/switch";
import { z } from "zod";

const createLeaseSchema = z.object({
    propertyName: z.string().min(1, "Property name is required"),
    tenantWallet: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana Address"),
    tenantEmail: z.string().email("Invalid email address"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    monthlyRent: z.number().positive("Rent must be greater than 0"),
    securityDeposit: z.number().nonnegative(),
    preferredStablecoin: z.enum(["USDC", "PYUSD"]),
    enableAutoPay: z.boolean(),
});

export default function AddLeaseModal() {
    const form = useForm({
        defaultValues: {
            propertyName: "",
            tenantWallet: "",
            tenantEmail: "",
            startDate: "",
            endDate: "",
            monthlyRent: 0,
            securityDeposit: 0,
            preferredStablecoin: "USDC",
            enableAutoPay: false,
        },
        validators: { onChange: createLeaseSchema },
        onSubmit: async ({ value }) => {
            console.log("Deploying Lease to Solana:", value);
            // Trigger your Solana Program instruction here
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-auth-navy hover:bg-auth-slate text-white gap-2 rounded-xl h-11 px-6 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    Add Lease
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-white shadow-2xl">
                <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-sol-indigo/10 p-2 rounded-lg">
                                    <ShieldCheck className="h-5 w-5 text-sol-indigo" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sol-indigo">Smart Contract Lease</span>
                            </div>
                            <DialogTitle className="text-3xl font-extrabold text-auth-navy tracking-tight">Create New Lease</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Set up property, tenant, and financial details in one simple view.
                            </DialogDescription>
                        </DialogHeader>

                        {/* SECTION: PROPERTY DETAILS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                <Building2 className="h-4 w-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Property Details</h3>
                            </div>
                            <form.Field name="propertyName" children={(field) => (
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Property Name</Label>
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="The Ledger Residences"
                                        className="h-12 rounded-xl bg-surface-secondary border-none font-medium text-auth-navy focus-visible:ring-2 focus-visible:ring-sol-indigo"
                                    />
                                </div>
                            )} />
                        </section>

                        {/* SECTION: TENANT INFO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                <User className="h-4 w-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Tenant Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="tenantWallet" children={(field) => (
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Tenant Wallet Address</Label>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Solana Address (0x...)" className="h-12 rounded-xl bg-surface-secondary border-none font-mono text-xs" />
                                    </div>
                                )} />
                                <form.Field name="tenantEmail" children={(field) => (
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Tenant Email</Label>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="tenant@example.com" className="h-12 rounded-xl bg-surface-secondary border-none" />
                                    </div>
                                )} />
                            </div>
                        </section>

                        {/* SECTION: FINANCIAL TERMS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                <DollarSign className="h-4 w-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Financial Terms</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="monthlyRent" children={(field) => (
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Monthly Rent</Label>
                                        <div className="relative">
                                            <Input type="number" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} className="h-12 rounded-xl bg-surface-secondary border-none pr-16 font-bold" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">USDC</span>
                                        </div>
                                    </div>
                                )} />
                                <form.Field name="securityDeposit" children={(field) => (
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Security Deposit</Label>
                                        <div className="relative">
                                            <Input type="number" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} className="h-12 rounded-xl bg-surface-secondary border-none pr-16 font-bold" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">USDC</span>
                                        </div>
                                    </div>
                                )} />
                            </div>
                        </section>

                        {/* SECTION: ON-CHAIN SETTLEMENT */}
                        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-auth-navy flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-sol-indigo" />
                                        On-Chain Settlement
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Select preferred stablecoin for automated distributions.</p>
                                </div>
                                <form.Field name="enableAutoPay" children={(field) => (
                                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
                                        <Label className="text-[10px] font-bold uppercase text-auth-navy">Auto-Pay</Label>
                                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                                    </div>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {["USDC", "PYUSD"].map((coin) => (
                                    <button
                                        key={coin}
                                        type="button"
                                        onClick={() => form.setFieldValue("preferredStablecoin", coin as any)}
                                        className={`flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all ${form.getFieldValue("preferredStablecoin") === coin
                                            ? "border-sol-indigo bg-white shadow-md ring-4 ring-sol-indigo/5"
                                            : "border-transparent bg-slate-100 text-slate-400 opacity-60"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${coin === 'USDC' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                                            {coin[0]}
                                        </div>
                                        <span className="font-black text-xs tracking-widest">{coin}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <DialogFooter className="p-8 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between sm:justify-between">
                        <button type="button" className="text-xs font-bold text-slate-400 hover:text-auth-navy transition-colors">
                            Save Draft
                        </button>
                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                            children={([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="bg-auth-navy hover:bg-auth-slate text-white h-12 px-10 rounded-xl font-bold shadow-xl shadow-navy-100/40"
                                >
                                    {isSubmitting ? "Deploying..." : "Review & Send Lease"}
                                </Button>
                            )}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}