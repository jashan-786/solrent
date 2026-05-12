"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram,
} from "@solana/web3.js";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from "axios";
import { mutate } from "swr";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Activity, Loader2, ShieldCheck, ShieldAlert, Zap, XCircle, ZapOff } from "lucide-react";
import {
    getProgram,
    getLeasePDA,
    getDelegatePDA,
    getStablecoinMint
} from "@repo/anchor";

export function AutoPayModal({ lease, buildingWallet, onSync }: { lease: any, buildingWallet: string, onSync?: () => void }) {
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [onChainAutoPay, setOnChainAutoPay] = useState<boolean | null>(null);
    const [localAutoPay, setLocalAutoPay] = useState<boolean | null>(null);
    const [txStatus, setTxStatus] = useState<"idle" | "signing" | "confirming" | "syncing">("idle");

    const isAutoPayEnabled = useMemo(() => {
        if (localAutoPay !== null) return localAutoPay;
        return !!(lease?.autoPayEnabled || onChainAutoPay);
    }, [localAutoPay, lease?.autoPayEnabled, onChainAutoPay]);

    const checkOnChainStatus = async () => {
        if (!publicKey || !lease?.onChainId) return;
        try {
            const provider = new AnchorProvider(connection, wallet?.adapter as any, { commitment: "confirmed" });
            const program = getProgram(provider) as any;
            const landlordPubkey = new PublicKey(buildingWallet);
            const unitId = BigInt(lease.onChainId);
            const [leasePDA] = getLeasePDA(landlordPubkey, publicKey, unitId);

            const leaseAccount = await program.account.lease.fetch(leasePDA);
            setOnChainAutoPay(!!leaseAccount.auto_pay_enabled);
        } catch (err) {
            console.error("[AutoPayModal] Sync check failed:", err);
            setOnChainAutoPay(null);
        }
    };

    useEffect(() => {
        if (open && publicKey) checkOnChainStatus();
    }, [open, publicKey]);

    const toggleAutoPay = async () => {
        if (!publicKey || !wallet?.adapter || !lease) return;

        setLoading(true);
        setTxStatus("signing");

        try {
            const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
            const program = getProgram(provider) as any;
            const landlordPubkey = new PublicKey(buildingWallet);
            const unitId = BigInt(lease.onChainId);

            const [leasePDA] = getLeasePDA(landlordPubkey, publicKey, unitId);
            const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

            const STABLECOIN_MINT = getStablecoinMint(lease.stablecoin, { rpcEndpoint: connection.rpcEndpoint });
            const tenantAta = await getAssociatedTokenAddress(STABLECOIN_MINT, publicKey);

            const tx = new Transaction();
            const tenantAtaInfo = await connection.getAccountInfo(tenantAta);
            if (!tenantAtaInfo) {
                tx.add(createAssociatedTokenAccountInstruction(publicKey, tenantAta, publicKey, STABLECOIN_MINT));
            }

            const nextStatus = !isAutoPayEnabled;
            const approveAmount = nextStatus ? new BN("1000000000000000000") : new BN(0);

            tx.add(await program.methods
                .approveDelegate(new BN(unitId.toString()), approveAmount)
                .accounts({
                    payer: publicKey, landlord: landlordPubkey, tenant: publicKey,
                    tenantAta, delegate: delegatePDA, lease: leasePDA,
                    systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID,
                } as any)
                .instruction());

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            const signature = await sendTransaction(tx, connection);
            setTxStatus("confirming");
            await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

            setLocalAutoPay(nextStatus);
            setTxStatus("syncing");

            await axios.post(`/api/tenant/leases/approve-delegate/sync`, {
                leaseId: lease.id,
                enabled: nextStatus
            });

            if (onSync) onSync();

            setTimeout(() => {
                setLocalAutoPay(null);
                setOpen(false);
                setTxStatus("idle");
                setLoading(false);
            }, 1000);

        } catch (err: any) {
            console.error("[AutoPayModal] Error:", err);
            alert(err.message || "Transaction failed");
            setTxStatus("idle");
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !loading && setOpen(val)}>
            <DialogTrigger asChild>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isAutoPayEnabled
                    ? "bg-secondary-50 text-secondary-600 border border-secondary-100"
                    : "bg-sol-indigo text-white shadow-lg shadow-sol-indigo/20 hover:scale-[1.02] active:scale-[0.98]"
                    }`}>
                    {isAutoPayEnabled ? <ShieldCheck size={16} /> : <Zap size={16} />}
                    {isAutoPayEnabled ? "Auto-Pay: ON" : "Enable Auto-Pay"}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background-50 border-none rounded-3xl p-6 overflow-hidden">
                <div className="relative z-10">
                    <DialogHeader className="mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-sol-indigo/10 flex items-center justify-center mb-4">
                            <Activity className="text-sol-indigo" size={24} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-text-900 tracking-tight">
                            {isAutoPayEnabled ? "Disable Auto-Pay" : "Enable Auto-Pay"}
                        </DialogTitle>
                        <DialogDescription className="text-text-500 font-medium">
                            {isAutoPayEnabled
                                ? "By turning this off, you will need to manually pay your rent each month."
                                : "Allow the smart contract to automatically collect rent from your wallet on the due date."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mb-8">
                        <div className={`p-4 rounded-2xl border transition-colors ${isAutoPayEnabled ? "bg-secondary-50/50 border-secondary-100" : "bg-background-100 border-background-200"
                            }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-text-500 uppercase tracking-wider">Current Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isAutoPayEnabled ? "bg-secondary-500 animate-pulse" : "bg-text-300"}`} />
                                    <span className={`text-sm font-black ${isAutoPayEnabled ? "text-secondary-600" : "text-text-600"}`}>
                                        {isAutoPayEnabled ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {txStatus !== "idle" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-black text-sol-indigo uppercase tracking-[0.2em]">
                                        {txStatus === "signing" ? "Step 1: Secure Signing" :
                                            txStatus === "confirming" ? "Step 2: On-Chain Finalization" : "Step 3: Database Sync"}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-400">
                                        {txStatus === "signing" ? "33%" : txStatus === "confirming" ? "66%" : "99%"}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-sol-indigo/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sol-indigo transition-all duration-1000 ease-out"
                                        style={{ width: txStatus === "signing" ? "33%" : txStatus === "confirming" ? "66%" : "100%" }}
                                    />
                                </div>
                                <p className="text-xs font-medium text-text-500 italic">
                                    {txStatus === "signing" ? "Please approve the transaction in your wallet..." :
                                        txStatus === "confirming" ? "Waiting for Solana network confirmation..." : "Updating your dashboard state..."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <DialogClose asChild>
                            <button disabled={loading} className="flex-1 px-4 py-4 bg-background-100 text-text-600 rounded-2xl font-bold hover:bg-background-200 transition-all active:scale-95 disabled:opacity-50">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            onClick={toggleAutoPay}
                            disabled={loading || (connection.rpcEndpoint.includes("devnet") && lease?.stablecoin !== "USDC")}
                            className={`flex-[2] px-4 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 ${isAutoPayEnabled
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-sol-indigo text-white shadow-2xl shadow-sol-indigo/30"
                                }`}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (isAutoPayEnabled ? <ZapOff size={20} /> : <Zap size={20} />)}
                            <span className="tracking-tight">{isAutoPayEnabled ? "Turn OFF" : "Turn ON"}</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


