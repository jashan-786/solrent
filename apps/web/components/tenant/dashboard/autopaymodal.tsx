"use client";

import { useState, useEffect } from "react";

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
import { Activity, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import {
    getProgram,
    getLeasePDA,
    getDelegatePDA,
    getStablecoinMint
} from "@repo/anchor";

export function AutoPayModal({ lease, buildingWallet }: { lease: any, buildingWallet: string }) {
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [onChainAutoPay, setOnChainAutoPay] = useState<boolean | null>(null);

    const checkOnChainStatus = async () => {
        if (!publicKey || !lease) return;
        try {
            const landlordPubkey = new PublicKey(buildingWallet);
            const onChainIdStr = lease.onChainId || lease.unit.id;
            const unitId = BigInt(onChainIdStr);
            const [leasePDA] = getLeasePDA(landlordPubkey, publicKey, unitId);
            const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

            const info = await connection.getAccountInfo(delegatePDA);
            const isEnabled = !!info;
            setOnChainAutoPay(isEnabled);

        } catch (err: any) {
            if (err.response?.status === 401) {
                return;
            }

        }
    };

    const isAutoPayEnabled = onChainAutoPay !== null ? onChainAutoPay : (lease?.autoPayEnabled || false);
    const isMainnet = connection.rpcEndpoint?.toLowerCase().includes("mainnet");
    const isDevnetStablecoinAllowed = isMainnet || lease?.stablecoin === "USDC";

    useEffect(() => {
        if (open || publicKey) {
            checkOnChainStatus();
        }
    }, [open, publicKey, lease?.id]);

    const toggleAutoPay = async () => {
        if (!publicKey || !wallet?.adapter || !lease) return;
        if (!isDevnetStablecoinAllowed) {
            alert("Auto-pay for this stablecoin is only supported on mainnet. On devnet, please use USDC.");
            return;
        }

        setLoading(true);

        try {
            const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
            const program = getProgram(provider) as any;

            const landlordPubkey = new PublicKey(buildingWallet);
            const onChainIdStr = lease.onChainId || lease.unit.id;

            if (!onChainIdStr) {
                throw new Error("This lease is not fully initialized on-chain.");
            }

            const unitId = BigInt(onChainIdStr);

            const [leasePDA] = getLeasePDA(landlordPubkey, publicKey, unitId);
            const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

            const STABLECOIN_MINT = getStablecoinMint(lease.stablecoin, { rpcEndpoint: connection.rpcEndpoint });
            const tenantAta = await getAssociatedTokenAddress(STABLECOIN_MINT, publicKey);

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
            const tx = new Transaction();

            const tenantAtaInfo = await connection.getAccountInfo(tenantAta);
            if (!tenantAtaInfo) {
                tx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        tenantAta,
                        publicKey,
                        STABLECOIN_MINT
                    )
                );
            }

            const newStatus = !isAutoPayEnabled;
            const approveAmount = newStatus ? new BN("1000000000000000000") : new BN(0);

            const approveIx = await program.methods
                .approveDelegate(new BN(unitId.toString()), approveAmount)
                .accounts({
                    payer: publicKey,
                    landlord: landlordPubkey,
                    tenant: publicKey,
                    tenantAta: tenantAta,
                    delegate: delegatePDA,
                    lease: leasePDA,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                } as any)
                .instruction();

            tx.add(approveIx);
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            let signature;
            try {

                signature = await sendTransaction(tx, connection, { skipPreflight: true })
                    .catch((e: any) => {
                        const isCancellation = e.message?.toLowerCase().includes("user rejected") ||
                            e.name === "WalletSendTransactionError" ||
                            e.code === 4001 ||
                            e.toString().toLowerCase().includes("rejected");

                        if (isCancellation) {

                            return "__CANCELLED__";
                        }
                        throw e;
                    });

                if (signature === "__CANCELLED__") {
                    setLoading(false);
                    return;
                }
            } catch (e: any) {
                setLoading(false);
                alert("Failed to update Auto-Pay: " + (e.message || e.toString()));
                return;
            }

            await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

            await axios.post(`/api/tenant/leases/approve-delegate`, {
                leaseId: lease.id,
                transactionHash: signature,
                enabled: newStatus
            });

            await checkOnChainStatus();
            mutate("/api/tenant/dashboard");
            setOpen(false);
        } catch (err: any) {
            alert("An error occurred: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={isAutoPayEnabled ? "outline" : "default"}
                    className={`flex items-center gap-2 px-6 h-12 rounded-2xl font-bold transition-all ${isAutoPayEnabled 
                        ? "border-sol-emerald/30 text-sol-emerald bg-sol-emerald/5 hover:bg-sol-emerald/10 shadow-sm" 
                        : "bg-sol-indigo hover:bg-sol-indigo/90 text-white shadow-md shadow-sol-indigo/20"
                    }`}
                    disabled={!isDevnetStablecoinAllowed}
                >
                    <Activity size={18} className={isAutoPayEnabled ? "animate-pulse" : ""} />
                    {isAutoPayEnabled ? "Auto-Pay: ON" : "Enable Auto-Pay"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6 border-none shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-auth-navy flex items-center gap-2">
                        {isAutoPayEnabled ? (
                            <><ShieldAlert className="text-secondary-500" /> Disable Auto-Pay</>
                        ) : (
                            <><ShieldCheck className="text-sol-emerald" /> Enable Auto-Pay</>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-text-500 text-sm mt-2">
                        {isAutoPayEnabled
                            ? "By turning this off, you will need to manually pay your rent each month. Your landlord will no longer be able to automatically collect the funds."
                            : "By turning this on, you authorize the smart contract to automatically pay your rent on the due date. This saves you time and ensures you never miss a payment."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-background-50 p-4 rounded-xl border border-background-100 flex flex-col gap-2 mb-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-500 font-medium">Current Status</span>
                        <span className={`font-bold ${isAutoPayEnabled ? "text-sol-emerald" : "text-text-400"}`}>
                            {isAutoPayEnabled ? "ON" : "OFF"}
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="rounded-xl text-text-500 hover:text-auth-navy font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={toggleAutoPay}
                        disabled={loading || !lease}
                        className={`rounded-xl font-bold text-white shadow-md ${isAutoPayEnabled
                            ? "bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/20"
                            : "bg-sol-emerald hover:bg-sol-emerald/90 shadow-sol-emerald/20"
                            }`}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                            isAutoPayEnabled ? "Turn OFF Auto-Pay" : "Turn ON Auto-Pay"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
