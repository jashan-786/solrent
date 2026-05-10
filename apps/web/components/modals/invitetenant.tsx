"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
    UserPlus, Copy, Check, SendHorizontal, Search,
    Plus, FileText, Upload, X, Loader2, Sparkles, ArrowLeft
} from "lucide-react";

import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";


import { z } from "zod";

const leaseSchema = z.object({
    // Requires "LS-XXX-1234" format
    leaseId: z.string().regex(/^LS-[A-Z]{3}-\d{4}$/, "Invalid Lease ID format"),
    files: z.array(z.instanceof(File))
        .min(1, "At least one document is required")
        .refine((files) => files.every(f => f.size <= 10 * 1024 * 1024), "Max file size is 10MB")
});

const inviteSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Please enter a valid email"),
    leaseId: z.string().min(1, "Lease ID is required"),
});


export default function InviteTenantModal({ buildingName = "Azure Heights" }) {
    const [view, setView] = useState<"invite" | "create-lease" | "success">("invite");
    const [isGenerating, setIsGenerating] = useState(false);

    // 1. Invitation Form with Zod
    const inviteForm = useForm({
        defaultValues: { email: "", firstName: "", lastName: "", leaseId: "" },
        validators: { onChange: inviteSchema },
        onSubmit: () => setView("success"),
    });

    // 2. Lease Creation Form with Zod
    const leaseForm = useForm({
        defaultValues: { leaseId: "", files: [] as File[] },
        validators: { onChange: leaseSchema },
        onSubmit: async ({ value }) => {
            inviteForm.setFieldValue("leaseId", value.leaseId);
            setView("invite");
        },
    });

    const generateLeaseId = async () => {
        setIsGenerating(true);
        await new Promise((r) => setTimeout(r, 800));
        const newId = `LS-${buildingName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        leaseForm.setFieldValue("leaseId", newId);
        setIsGenerating(false);
    };

    return (
        <Dialog onOpenChange={(open) => !open && setView("invite")}>
            <DialogTrigger asChild>
                <Button className="bg-auth-navy hover:bg-auth-slate text-white gap-2 rounded-xl h-11 px-6">
                    <UserPlus className="h-4 w-4" /> Invite Tenant
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 border-none overflow-hidden bg-white shadow-2xl">

                {view === "create-lease" && (
                    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); leaseForm.handleSubmit(); }}>
                        <div className="p-8 space-y-6">
                            <DialogHeader>
                                <button type="button" onClick={() => setView("invite")} className="flex items-center gap-1 text-xs font-bold text-sol-indigo mb-2">
                                    <ArrowLeft className="h-3 w-3" /> Back
                                </button>
                                <DialogTitle className="text-2xl font-extrabold text-auth-navy">Create Lease</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5">
                                <leaseForm.Field
                                    name="leaseId"
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-grey">Lease ID</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    readOnly
                                                    value={field.state.value}
                                                    placeholder="Generate ID..."
                                                    className="h-12 rounded-xl bg-slate-50 border-dashed border-slate-300 font-mono text-sol-indigo"
                                                />
                                                <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={generateLeaseId} disabled={isGenerating}>
                                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                                                </Button>
                                            </div>
                                            {field.state.meta.errors && field.state.meta.errors.length > 0 && <p className="text-[10px] text-destructive font-bold">{field.state.meta.errors.map((e) => typeof e === 'string' ? e as string : (e as { message: string }).message).join(', ')}</p>}
                                        </div>
                                    )}
                                />

                                <leaseForm.Field
                                    name="files"
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-grey">Documents</Label>
                                            <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center bg-slate-50/50">
                                                <Upload className="h-6 w-6 text-sol-indigo mb-2" />
                                                <input
                                                    type="file"
                                                    className="text-xs ml-8"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) field.handleChange([file]);
                                                    }}
                                                />
                                            </div>
                                            {field.state.meta.errors && field.state.meta.errors.length > 0 && <p className="text-[10px] text-destructive font-bold">{field.state.meta.errors.map((e) => typeof e === 'string' ? e : (e as { message: string }).message).join(', ')}</p>}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-slate-50/50 border-t">
                            <Button type="submit" className="w-full h-12 rounded-xl bg-auth-navy font-bold text-white">
                                Confirm Lease
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {view === "invite" && (
                    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); inviteForm.handleSubmit(); }}>
                        <div className="p-8 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-extrabold text-auth-navy">Invite Tenant</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5">
                                <inviteForm.Field
                                    name="leaseId"
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[11px] font-bold uppercase tracking-widest text-text-grey">Lease ID</Label>
                                                <button type="button" onClick={() => setView("create-lease")} className="text-[11px] font-bold text-sol-indigo flex items-center gap-1">
                                                    <Plus className="h-3 w-3" /> New Lease
                                                </button>
                                            </div>
                                            <Input
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Search or Create..."
                                                className="h-12 rounded-xl bg-surface-secondary border-none"
                                            />
                                            {field.state.meta.errors && field.state.meta.errors.length > 0 && <p className="text-[10px] text-destructive font-bold">{field.state.meta.errors.map((e) => typeof e === 'string' ? e : (e as { message: string }).message).join(', ')}</p>}
                                        </div>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <inviteForm.Field name="firstName" children={(field) => (
                                        <div className="space-y-1">
                                            <Label className="text-[11px] uppercase text-text-grey">First Name</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="h-11 rounded-xl bg-surface-secondary border-none" />
                                        </div>
                                    )} />
                                    <inviteForm.Field name="lastName" children={(field) => (
                                        <div className="space-y-1">
                                            <Label className="text-[11px] uppercase text-text-grey">Last Name</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="h-11 rounded-xl bg-surface-secondary border-none" />
                                        </div>
                                    )} />
                                </div>

                                <inviteForm.Field name="email" children={(field) => (
                                    <div className="space-y-1">
                                        <Label className="text-[11px] uppercase text-text-grey">Email</Label>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="h-11 rounded-xl bg-surface-secondary border-none" />
                                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <p className="text-[10px] text-destructive font-bold">{field.state.meta.errors.map((e) => typeof e === 'string' ? e : (e as { message: string }).message).join(', ')}</p>}
                                    </div>
                                )} />
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-slate-50/50 border-t">
                            <inviteForm.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button type="submit" disabled={!canSubmit} className="w-full h-12 rounded-xl bg-auth-navy font-bold text-white">
                                        {isSubmitting ? "Generating..." : "Generate Invitation"}
                                    </Button>
                                )}
                            />
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}