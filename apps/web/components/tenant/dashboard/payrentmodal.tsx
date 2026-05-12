"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import {
    AnchorProvider,
    BN
} from "@coral-xyz/anchor";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
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
import { Wallet, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import {
    getLeasePDA,
    getDelegatePDA,
    getMetadataPDA,
    getMasterEditionPDA,
    METAPLEX_PROGRAM_ID,
    getStablecoinMint,
    getStablecoinDecimals
} from "@repo/anchor";
import idl from "@repo/anchor/idl/contract_solrent.json";
import { Program, Idl } from "@coral-xyz/anchor";

export function PayRentModal({ payment, buildingWallet }: { payment: any, buildingWallet: string }) {
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "success" | "error">("idle");
    const [open, setOpen] = useState(false);
    const [ataBalance, setAtaBalance] = useState<number | null>(null);
    const [totalBalance, setTotalBalance] = useState<number | null>(null);
    const [requestingFaucet, setRequestingFaucet] = useState(false);

    const stablecoinMint = useMemo(
        () => getStablecoinMint(payment.stablecoin, { rpcEndpoint: connection.rpcEndpoint }),
        [payment.stablecoin, connection.rpcEndpoint]
    );
    const stablecoinDecimals = useMemo(
        () => getStablecoinDecimals(payment.stablecoin, stablecoinMint),
        [payment.stablecoin, stablecoinMint]
    );

    const isMainnet = connection.rpcEndpoint?.toLowerCase().includes("mainnet");
    const isDevnetStablecoinAllowed = isMainnet || payment.stablecoin === "USDC";

    useEffect(() => {
        const fetchBalance = async () => {
            if (!publicKey || !open) return;
            if (!isDevnetStablecoinAllowed) {
                setAtaBalance(0);
                setTotalBalance(0);
                return;
            }
            try {
                const ata = await getAssociatedTokenAddress(stablecoinMint, publicKey);
                try {
                    const info = await connection.getTokenAccountBalance(ata);
                    setAtaBalance(info.value.uiAmount);
                } catch {
                    setAtaBalance(0);
                }
                const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { mint: stablecoinMint });
                let totalUi = 0;
                for (const acc of tokenAccounts.value) {
                    try {
                        const parsed = await getAccount(connection, acc.pubkey);
                        totalUi += Number(parsed.amount) / (10 ** stablecoinDecimals);
                    } catch { }
                }
                setTotalBalance(totalUi);
            } catch (e) {
                setAtaBalance(0);
                setTotalBalance(0);
            }
        };
        fetchBalance();
    }, [publicKey, open, connection, stablecoinMint, stablecoinDecimals]);

    const handlePayment = async () => {
        if (!publicKey || !wallet?.adapter) return;
        if (!isDevnetStablecoinAllowed) {
            alert("This stablecoin is only supported on mainnet. On devnet, please use USDC.");
            return;
        }

        setLoading(true);
        setStatus("signing");

        try {
            const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
            const program = new Program(idl as Idl, provider) as any;

            const landlordPubkey = new PublicKey(payment.landlordWallet || buildingWallet);
            const onChainIdStr = payment.onChainId || payment.unitId;
            if (!onChainIdStr) throw new Error("This lease is not fully initialized on-chain.");

            const unitId = BigInt(onChainIdStr);
            const [leasePDA] = getLeasePDA(landlordPubkey, publicKey, unitId);
            const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

            const leaseAccount = await program.account.lease.fetch(leasePDA);
            const chainRentBn = new BN(leaseAccount.rentAmount.toString());

            const tenantAta = await getAssociatedTokenAddress(stablecoinMint, publicKey);
            const landlordAta = await getAssociatedTokenAddress(stablecoinMint, landlordPubkey);

            const nftMint = Keypair.generate();
            const [nftTokenAccount] = PublicKey.findProgramAddressSync(
                [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer()],
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const [metadataPDA] = getMetadataPDA(nftMint.publicKey);
            const [masterEditionPDA] = getMasterEditionPDA(nftMint.publicKey);

            const { blockhash: freshBlockhash, lastValidBlockHeight: freshHeight } = await connection.getLatestBlockhash("confirmed");
            const payTx = new Transaction();

            const landlordAtaInfo = await connection.getAccountInfo(landlordAta);
            if (!landlordAtaInfo) {
                payTx.add(createAssociatedTokenAccountInstruction(publicKey, landlordAta, landlordPubkey, stablecoinMint));
            }

            const currentAta = await connection.getAccountInfo(tenantAta);
            if (!currentAta) {
                payTx.add(createAssociatedTokenAccountInstruction(publicKey, tenantAta, publicKey, stablecoinMint));
            }

            const executePaymentIx = await program.methods
                .payManually(new BN(unitId.toString()), chainRentBn)
                .accounts({
                    tenant: publicKey,
                    landlord: landlordPubkey,
                    landlordAta: landlordAta,
                    tenantAta: tenantAta,
                    lease: leasePDA,
                    mint: nftMint.publicKey,
                    nftTokenAccount: nftTokenAccount,
                    metadata: metadataPDA,
                    masterEdition: masterEditionPDA,
                    tokenMetadataProgram: METAPLEX_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                } as any)
                .instruction();
            payTx.add(executePaymentIx);
            payTx.recentBlockhash = freshBlockhash;
            payTx.feePayer = publicKey;

            let signature: string;
            try {
                signature = await sendTransaction(payTx, connection, { signers: [nftMint], skipPreflight: true });
            } catch (e: any) {
                if (e.message?.toLowerCase().includes("user rejected") || e.name === "WalletSendTransactionError" || e.code === 4001 || e.toString().toLowerCase().includes("rejected")) {

                    setLoading(false);
                    setStatus("idle");
                    return;
                }
                throw e;
            }

            setStatus("confirming");
            await connection.confirmTransaction({ signature, blockhash: freshBlockhash, lastValidBlockHeight: freshHeight }, "confirmed");

            try {
                await axios.post(`/api/tenant/leases/approve-delegate/sync`, { leaseId: payment.leaseId, enabled: true });
            } catch { }

            await axios.post(`/api/tenant/payments/${payment.id}/confirm`, {
                transactionHash: signature,
                nftReceiptMint: nftMint.publicKey.toBase58()
            });

            setStatus("success");
            mutate("/api/tenant/dashboard");
            setTimeout(() => { setOpen(false); setStatus("idle"); }, 3000);

        } catch (error: any) {

            setStatus("error");
            if (!error.message?.toLowerCase().includes("user rejected")) {
                alert("Payment failed: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold gap-2">
                    Pay Rent
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-primary-900">Rent Payment</DialogTitle>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold animate-pulse">
                            v2.0 - DEBUG MODE
                        </span>
                    </div>
                    <DialogDescription className="text-text-500">
                        Confirm your rent payment for {payment.month || "this month"}.
                    </DialogDescription>
                </DialogHeader>

                {ataBalance !== null && totalBalance !== null && totalBalance < payment.amount && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">Insufficient funds</p>
                        </div>
                        <p className="text-[11px] text-text-400 font-medium">
                            You need more {payment.stablecoin} to pay this rent.
                        </p>
                        {!isMainnet && payment.stablecoin === "USDC" && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full font-bold"
                                disabled={requestingFaucet}
                                onClick={async () => {
                                    try {
                                        setRequestingFaucet(true);
                                        await axios.post("/api/dev/faucet/usdc", { amount: Math.max(1000, Number(payment.amount || 0)) });
                                        setAtaBalance(null);
                                        setTotalBalance(null);
                                    } catch (e: any) {
                                        alert(e?.response?.data?.message || "Failed to mint devnet test USDC");
                                    } finally {
                                        setRequestingFaucet(false);
                                    }
                                }}
                            >
                                {requestingFaucet ? "Minting..." : "Mint Devnet Test USDC (Solrent)"}
                            </Button>
                        )}
                    </div>
                )}

                <div className="py-6 space-y-4">
                    <div className="bg-background-100 p-4 rounded-xl flex justify-between items-center border border-background-200">
                        <div>
                            <p className="text-[10px] font-bold text-text-400 uppercase tracking-widest mb-1">Amount Due</p>
                            <h2 className="text-2xl font-black text-primary-900">${payment.amount} <span className="text-sm font-medium text-text-400">USDC</span></h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-text-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-1.5 text-secondary-500 font-bold">
                                <ShieldCheck size={14} />
                                Verified
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-primary-900 font-medium">
                            <div className="h-2 w-2 rounded-full bg-secondary-400" />
                            Secure Smart Contract Payment
                        </div>
                        <div className="flex items-center gap-3 text-sm text-primary-900 font-medium">
                            <div className="h-2 w-2 rounded-full bg-secondary-400" />
                            Proof of Rent NFT Receipt
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {status === "success" ? (
                        <div className="flex items-center justify-center w-full gap-2 text-secondary-500 font-bold py-2 bg-secondary-50 rounded-xl">
                            <CheckCircle2 size={20} /> Payment Successful!
                        </div>
                    ) : (
                        <Button
                            onClick={handlePayment}
                            disabled={loading || !publicKey || !isDevnetStablecoinAllowed || (totalBalance !== null && totalBalance < payment.amount)}
                            className="w-full h-14 rounded-2xl bg-primary-900 hover:bg-primary-950 text-white font-black text-lg shadow-xl shadow-primary-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>{status === "signing" ? "Confirm in Wallet..." : "Verifying on Chain..."}</span>
                                </div>
                            ) : (
                                `Confirm ${payment.amount.toLocaleString()} ${payment.stablecoin} Payment`
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}