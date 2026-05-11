
"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
    Building2, User, Calendar, DollarSign,
    ShieldCheck, Zap, Plus, Loader2, CheckCircle2, FileText
} from "lucide-react";

import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Switch } from "@repo/ui/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@repo/ui/components/ui/select";
import { z } from "zod";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Keypair, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import {
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    getProgram,
    getLeasePDA,
    getVaultPDA,
    getMetadataPDA,
    getMasterEditionPDA,
    METAPLEX_PROGRAM_ID,
    getDelegatePDA,
    getStablecoinMint,
    getStablecoinDecimals,
} from "@repo/anchor";
import axios from "axios";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const createLeaseSchema = z.object({
    buildingId: z.string().min(1, "Building is required"),
    unitId: z.string().min(1, "Unit is required"),
    tenantWallet: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana Address"),
    tenantEmail: z.string().email("Invalid email address"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    monthlyRent: z.number().positive("Rent must be greater than 0"),
    securityDeposit: z.number().nonnegative(),
    preferredStablecoin: z.enum(["USDC", "PYUSD"]),
    enableAutoPay: z.boolean(),
});

export default function AddLeaseModal({ isVerified = true }: { isVerified?: boolean }) {
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<"idle" | "uploading" | "signing" | "confirming" | "minting" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [leaseDocumentFile, setLeaseDocumentFile] = useState<File | null>(null);

    const [selectedBuildingId, setSelectedBuildingId] = useState("");

    const isMainnet = connection.rpcEndpoint?.toLowerCase().includes("mainnet");
    const stablecoinOptions = isMainnet ? (["USDC", "PYUSD"] as const) : (["USDC"] as const);

    const { data: buildingsData } = useSWR("/api/landlord/buildings", fetcher);
    const { data: unitsData } = useSWR(
        selectedBuildingId ? `/api/landlord/units?buildingId=${selectedBuildingId}` : null,
        fetcher
    );
    const { data: tenantsData } = useSWR("/api/landlord/tenants", fetcher);

    const buildings = buildingsData?.buildings || [];
    const units = (unitsData?.units || []).filter((u: any) => !u.occupied);

    const form = useForm({
        defaultValues: {
            buildingId: "",
            unitId: "",
            tenantWallet: "",
            tenantEmail: "",
            startDate: "",
            endDate: "",
            monthlyRent: 0,
            securityDeposit: 0,
            preferredStablecoin: "USDC" as "USDC" | "PYUSD",
            enableAutoPay: false,
        },
        validators: { onChange: createLeaseSchema },
        onSubmit: async ({ value }) => {
            if (!publicKey || !wallet?.adapter) {
                setErrorMsg("Please connect your wallet first");
                setStatus("error");
                return;
            }
            if (!leaseDocumentFile) {
                setErrorMsg("Lease PDF is required before creating the lease.");
                setStatus("error");
                return;
            }

            setLoading(true);
            setStatus("idle");
            setErrorMsg("");

            try {
                if (!isMainnet && value.preferredStablecoin !== "USDC") {
                    form.setFieldValue("preferredStablecoin", "USDC");
                }

                let leaseDocumentUrl: string | null = null;
                if (leaseDocumentFile) {
                    setStatus("uploading");
                    const formData = new FormData();
                    formData.append("file", leaseDocumentFile);
                    const uploadRes = await axios.post("/api/landlord/leases/upload-document", formData);
                    leaseDocumentUrl = uploadRes?.data?.leaseDocumentPath || null;
                }

                setStatus("signing");
                const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
                const program = getProgram(provider) as any;
                const onChainId = BigInt(Date.now());
                const tenantPubkey = new PublicKey(value.tenantWallet);
                const [leasePDA] = getLeasePDA(publicKey, tenantPubkey, onChainId);
                const [delegatePDA] = getDelegatePDA(leasePDA, onChainId);

                const stablecoinMint = getStablecoinMint(value.preferredStablecoin, { rpcEndpoint: connection.rpcEndpoint });
                const stablecoinDecimals = getStablecoinDecimals(value.preferredStablecoin, stablecoinMint);
                const rentAmountOnChain = new BN(value.monthlyRent).mul(new BN(10).pow(new BN(stablecoinDecimals)));

                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

                const tx = new Transaction();

                const startTimestamp = Math.floor(new Date(value.startDate).getTime() / 1000);
                const endTimestamp = Math.floor(new Date(value.endDate).getTime() / 1000);

                const initLeaseIx = await program.methods
                    .initializeLease(new BN(onChainId.toString()), rentAmountOnChain, 1, new BN(startTimestamp), new BN(endTimestamp))
                    .accounts({
                        landlord: publicKey,
                        tenant: tenantPubkey,
                        lease: leasePDA,
                        vault: getVaultPDA(publicKey, onChainId)[0],
                        systemProgram: SystemProgram.programId,
                    } as any)
                    .instruction();
                tx.add(initLeaseIx);

                tx.recentBlockhash = blockhash;
                tx.feePayer = publicKey;

                const leaseSig = await sendTransaction(tx, connection);

                setStatus("confirming");
                const leaseConfirmation = await connection.confirmTransaction({
                    signature: leaseSig,
                    blockhash,
                    lastValidBlockHeight,
                }, "confirmed");

                if (leaseConfirmation.value.err) {
                    throw new Error(`Lease initialization failed on-chain: ${JSON.stringify(leaseConfirmation.value.err)}`);
                }

                setStatus("minting");
                const nftMint = Keypair.generate();

                const [nftTokenAccount] = PublicKey.findProgramAddressSync(
                    [
                        tenantPubkey.toBuffer(),
                        Buffer.from([
                            6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169
                        ]),
                        nftMint.publicKey.toBuffer()
                    ],
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const [metadataPDA] = getMetadataPDA(nftMint.publicKey);
                const [masterEditionPDA] = getMasterEditionPDA(nftMint.publicKey);

                const { blockhash: mintBlockhash, lastValidBlockHeight: mintBlockHeight } = await connection.getLatestBlockhash("confirmed");
                const mintTx = await program.methods
                    .mintReceiptNft(new BN(onChainId.toString()))
                    .accounts({
                        payer: publicKey,
                        tenant: tenantPubkey,
                        metadata: metadataPDA,
                        masterEdition: masterEditionPDA,
                        mint: nftMint.publicKey,
                        tokenAccount: nftTokenAccount,
                        tokenMetadataProgram: METAPLEX_PROGRAM_ID,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                        rent: SYSVAR_RENT_PUBKEY,
                    } as any)
                    .signers([nftMint])
                    .transaction();

                mintTx.recentBlockhash = mintBlockhash;
                mintTx.feePayer = publicKey;

                const mintSig = await sendTransaction(mintTx, connection, { signers: [nftMint] });
                const mintConfirmation = await connection.confirmTransaction({
                    signature: mintSig,
                    blockhash: mintBlockhash,
                    lastValidBlockHeight: mintBlockHeight,
                }, "confirmed");

                if (mintConfirmation.value.err) {
                    throw new Error(`NFT Minting failed on-chain: ${JSON.stringify(mintConfirmation.value.err)}`);
                }

                setStatus("saving");
                await axios.post("/api/landlord/leases", {
                    tenantWallet: value.tenantWallet,
                    tenantEmail: value.tenantEmail,
                    unitId: value.unitId,
                    buildingId: value.buildingId,
                    monthlyRent: value.monthlyRent,
                    securityDeposit: value.securityDeposit,
                    stablecoin: value.preferredStablecoin,
                    startDate: value.startDate,
                    endDate: value.endDate,
                    autoPayEnabled: value.enableAutoPay,
                    onChainId: onChainId.toString(),
                    onChainAddress: leasePDA.toBase58(),
                    transactionHash: leaseSig,
                    leaseNftMint: nftMint.publicKey.toBase58(),
                    leaseDocumentUrl,
                });

                setStatus("success");
                mutate("/api/landlord/leases");
                mutate("/api/landlord/dashboard");
                mutate(`/api/landlord/units?buildingId=${value.buildingId}`);

                setTimeout(() => {
                    setOpen(false);
                    setStatus("idle");
                    form.reset();
                    setSelectedBuildingId("");
                    setLeaseDocumentFile(null);
                }, 2500);

            } catch (error: any) {
                
                setErrorMsg(error?.response?.data?.message || error.message || "Lease creation failed");
                setStatus("error");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setStatus("idle"); setErrorMsg(""); setLeaseDocumentFile(null); } }}>
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
                                Select a building and unit, then set up tenant and financial details.
                            </DialogDescription>
                        </DialogHeader>

                        {!isVerified && (
                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 text-amber-700 font-bold">
                                    <ShieldCheck className="h-5 w-5" />
                                    Action Required
                                </div>
                                <p className="text-sm text-amber-600 leading-relaxed font-medium">
                                    Your wallet must be verified before you can create leases. This ensures you have an active USDC account to receive payments. Please complete the setup on your dashboard.
                                </p>
                            </div>
                        )}

                        <div className={!isVerified ? "opacity-50 pointer-events-none select-none space-y-8" : "space-y-8"}>
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                    <Building2 className="h-4 w-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Property Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Building</Label>
                                        <form.Field name="buildingId" children={(field) => (
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(val) => {
                                                    field.handleChange(val);
                                                    setSelectedBuildingId(val);
                                                    form.setFieldValue("unitId", "");
                                                }}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-surface-secondary border-none font-medium text-auth-navy">
                                                    <SelectValue placeholder="Select building" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {buildings.map((b: any) => (
                                                        <SelectItem key={b.id} value={b.id}>{b.name} — {b.address}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Unit</Label>
                                        <form.Field name="unitId" children={(field) => (
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(val) => {
                                                    field.handleChange(val);
                                                    const selectedUnit = units.find((u: any) => u.id === val);
                                                    if (selectedUnit) {
                                                        form.setFieldValue("monthlyRent", selectedUnit.rentAmount);
                                                    }
                                                }}
                                                disabled={!selectedBuildingId}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-surface-secondary border-none font-medium text-auth-navy">
                                                    <SelectValue placeholder={selectedBuildingId ? "Select unit" : "Select building first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map((u: any) => (
                                                        <SelectItem key={u.id} value={u.id}>
                                                            Unit {u.unitNumber} — {u.bedrooms}BR / {u.rentAmount} USDC
                                                        </SelectItem>
                                                    ))}
                                                    {units.length === 0 && selectedBuildingId && (
                                                        <div className="px-4 py-3 text-xs text-slate-400 italic">No available units</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2 text-auth-navy">
                                        <User className="h-4 w-4" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Tenant Selection</h3>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold italic">* Registered tenants only</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Select Tenant</Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const t = (tenantsData?.tenants || []).find((t: any) => t.id === val);
                                                if (t) {
                                                    form.setFieldValue("tenantWallet", t.walletAddress || "");
                                                    form.setFieldValue("tenantEmail", t.email || "");
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-surface-secondary border-none font-medium text-auth-navy">
                                                <SelectValue placeholder="Search/Select Tenant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(tenantsData?.tenants || [])
                                                    .filter((t: any) => t.leaseStatus === "PENDING" || !t.leaseStatus)
                                                    .map((t: any) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            {t.name} ({t.email})
                                                        </SelectItem>
                                                    ))}
                                                {(tenantsData?.tenants || []).length === 0 && (
                                                    <div className="px-4 py-3 text-xs text-slate-400 italic">No tenants found. Invite them first!</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <form.Field name="tenantWallet" children={(field) => (
                                        <div className="space-y-2 opacity-60">
                                            <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Wallet Address (Auto)</Label>
                                            <Input readOnly value={field.state.value} placeholder="Automatically filled" className="h-12 rounded-xl bg-slate-100 border-none font-mono text-[10px]" />
                                        </div>
                                    )} />
                                    <form.Field name="tenantEmail" children={(field) => (
                                        <div className="space-y-2 opacity-60">
                                            <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Email Address (Auto)</Label>
                                            <Input readOnly value={field.state.value} placeholder="Automatically filled" className="h-12 rounded-xl bg-slate-100 border-none font-medium text-xs" />
                                        </div>
                                    )} />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                    <Calendar className="h-4 w-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Contract Period</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <form.Field name="startDate" children={(field) => (
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">Start Date</Label>
                                            <Input type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="h-12 rounded-xl bg-surface-secondary border-none font-medium" />
                                        </div>
                                    )} />
                                    <form.Field name="endDate" children={(field) => (
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">End Date</Label>
                                            <Input type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="h-12 rounded-xl bg-surface-secondary border-none font-medium" />
                                        </div>
                                    )} />
                                </div>
                            </section>

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
                                    {stablecoinOptions.map((coin) => (
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
                                {!isMainnet && (
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        Devnet uses Devnet USDC for testing. Mainnet supports USDC and PYUSD.
                                    </p>
                                )}
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-auth-navy border-b border-slate-100 pb-2">
                                    <FileText className="h-4 w-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Lease Document</h3>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-text-grey uppercase ml-1">PDF Agreement (Optional)</Label>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        onChange={(e) => setLeaseDocumentFile(e.target.files?.[0] || null)}
                                        className="h-12 rounded-xl bg-surface-secondary border-none font-medium file:mr-3 file:rounded-md file:border-0 file:bg-auth-navy file:px-3 file:py-1 file:text-white file:text-xs file:font-bold"
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        Lease agreement PDF is required and will be visible to both landlord and tenant.
                                    </p>
                                </div>
                            </section>

                            {status === "error" && errorMsg && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                                    {errorMsg}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between sm:justify-between">
                        <button type="button" className="text-xs font-bold text-slate-400 hover:text-auth-navy transition-colors" onClick={() => setOpen(false)}>
                            Cancel
                        </button>

                        {status === "success" ? (
                            <div className="flex items-center gap-2 text-secondary-500 font-bold text-sm bg-secondary-50 px-6 py-3 rounded-xl">
                                <CheckCircle2 size={18} />
                                Lease Created On-Chain!
                            </div>
                        ) : (
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit || loading}
                                        className="bg-auth-navy hover:bg-auth-slate text-white h-12 px-10 rounded-xl font-bold shadow-xl shadow-navy-100/40"
                                    >
                                        {status === "uploading" ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading Lease PDF...</>
                                        ) : status === "signing" ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Check Wallet...</>
                                        ) : status === "confirming" ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming on Solana...</>
                                        ) : status === "minting" ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting Lease NFT...</>
                                        ) : status === "saving" ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Lease...</>
                                        ) : (
                                            "Deploy Lease On-Chain"
                                        )}
                                    </Button>
                                )}
                            />
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}