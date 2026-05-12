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
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Activity, Loader2, ShieldCheck, ShieldAlert, Zap, XCircle } from "lucide-react";
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
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isAutoPayEnabled 
                        ? "bg-secondary-50 text-secondary-600 border border-secondary-100" 
                        : "bg-sol-indigo text-white shadow-lg shadow-sol-indigo/20"
                }`}>
                    {isAutoPayEnabled ? <ShieldCheck size={16} /> : <Zap size={16} />}
                    {isAutoPayEnabled ? "Auto-Pay: ON" : "Enable Auto-Pay"}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6 border-none shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-background-100">
                    {loading && <div className="h-full bg-sol-emerald animate-shimmer" style={{ width: '40%' }} />}
                </div>

                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-auth-navy flex items-center gap-2">
                        {isAutoPayEnabled ? (
                            <><ShieldAlert className="text-secondary-500" /> Manage Auto-Pay</>
                        ) : (
                            <><ShieldCheck className="text-sol-emerald" /> Activate Auto-Pay</>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-text-500 text-sm mt-2 leading-relaxed">
                        {isAutoPayEnabled
                            ? "Auto-pay is currently active. Your rent will be collected automatically on each due date using your approved smart contract delegate."
                            : "Enable smart contract delegation to automate your rent payments. Funds will only be moved on the exact billing date defined in your lease."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mb-6">
                    <div className="bg-background-50 p-4 rounded-2xl border border-background-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-400 font-semibold uppercase tracking-wider text-[10px]">Current Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`h-2 w-2 rounded-full ${isAutoPayEnabled ? "bg-sol-emerald animate-pulse" : "bg-text-300"}`} />
                                <span className={`font-black tracking-tight ${isAutoPayEnabled ? "text-sol-emerald" : "text-text-400"}`}>
                                    {isAutoPayEnabled ? "ACTIVE" : "DISABLED"}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-400 font-semibold uppercase tracking-wider text-[10px]">Verification</span>
                            <span className="text-auth-navy font-bold flex items-center gap-1">
                                <Zap size={12} className="text-secondary-500" />
                                Smart Contract
                            </span>
                        </div>
                    </div>

                    {txStatus !== "idle" && (
                        <div className="flex items-center gap-3 p-3 bg-sol-indigo/5 rounded-xl border border-sol-indigo/10 animate-in fade-in slide-in-from-bottom-2">
                            <Loader2 className="h-4 w-4 text-sol-indigo animate-spin" />
                            <span className="text-xs font-bold text-sol-indigo uppercase tracking-wider">
                                {txStatus === "signing" && "Waiting for Signature..."}
                                {txStatus === "confirming" && "Finalizing on Chain..."}
                                {txStatus === "syncing" && "Updating Backend..."}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="flex-1 rounded-xl text-text-500 hover:text-auth-navy font-bold h-12"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={toggleAutoPay}
                        disabled={loading || !lease?.onChainId}
                        className={`flex-[2] h-12 rounded-xl font-black text-white shadow-lg transition-all active:scale-[0.98] ${
                            isAutoPayEnabled
                            ? "bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/20"
                            : "bg-sol-emerald hover:bg-sol-emerald/90 shadow-sol-emerald/20"
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            isAutoPayEnabled ? (
                                <div className="flex items-center gap-2">
                                    <XCircle size={18} />
                                    <span>Turn OFF Auto-Pay</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Zap size={18} />
                                    <span>Turn ON Auto-Pay</span>
                                </div>
                            )
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

