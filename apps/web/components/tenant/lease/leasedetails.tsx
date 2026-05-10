import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorProvider, BN, Program, Idl } from "@coral-xyz/anchor";
import { getLeasePDA, getDelegatePDA, getStablecoinMint, getStablecoinDecimals } from "@repo/anchor";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../../../../../packages/anchor/idl/contract_solrent.json";
import { Button } from "@repo/ui/components/ui/button";
import { MapPin, Calendar, User, Zap, Loader2, CheckCircle2 } from "lucide-react";
import React from "react";
import axios from "axios";
import { mutate } from "swr";

export const LeaseDetailsCard = ({ lease }: { lease: any }) => {
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = React.useState(false);
    const [isApproved, setIsApproved] = React.useState(lease.recurringApproved);
    const isMainnet = connection.rpcEndpoint?.toLowerCase().includes("mainnet");
    const isDevnetStablecoinAllowed = isMainnet || lease?.stablecoin === "USDC";

    const handleAuthorize = async () => {
        if (!publicKey || !wallet?.adapter || !lease.onChainAddress) return;
        if (!isDevnetStablecoinAllowed) {
            alert("This stablecoin is only supported on mainnet. On devnet, please use USDC.");
            return;
        }

        setLoading(true);
        try {
            const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
            const program = new Program(idl as Idl, provider) as any;

            const landlordPubkey = new PublicKey(lease.unit?.building?.landlord?.walletAddress || lease.building?.landlord?.walletAddress);
            const onChainId = BigInt(lease.onChainId);
            const leasePDA = new PublicKey(lease.onChainAddress);
            const [delegatePDA] = getDelegatePDA(leasePDA, onChainId);

            const STABLECOIN_MINT = getStablecoinMint(lease.stablecoin, { rpcEndpoint: connection.rpcEndpoint });
            const tenantAta = await getAssociatedTokenAddress(STABLECOIN_MINT, publicKey);

            const decimals = getStablecoinDecimals(lease.stablecoin);
            const approvalAmount = new BN(lease.monthlyRent).mul(new BN(12)).mul(new BN(10).pow(new BN(decimals)));

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

            const approveIx = await program.methods
                .approveDelegate(new BN(onChainId.toString()), approvalAmount)
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

            try {
                const sim = await connection.simulateTransaction(tx);
                if (sim.value.err) {


                }
            } catch (e) {

            }

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
                alert("Authorization failed: " + (e.message || e.toString()));
                return;
            }

            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, "confirmed");

            await axios.post("/api/tenant/leases/approve-delegate", {
                leaseId: lease.id,
                transactionHash: signature,
                enabled: true
            });

            setIsApproved(true);
            mutate("/api/tenant/leases");
            mutate("/api/tenant/dashboard");
        } catch (error: any) {


        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-background-100 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-primary-900 mb-2">
                            {lease.unit?.building?.name} #{lease.unit?.unitNumber}
                        </h2>
                        <p className="flex items-center gap-1 text-text-500 text-sm">
                            <MapPin size={16} /> {lease.unit?.building?.address}, {lease.unit?.building?.city}
                        </p>
                    </div>

                    {!isApproved && lease.onChainAddress && (
                        <Button
                            onClick={handleAuthorize}
                            disabled={loading || !publicKey || !isDevnetStablecoinAllowed}
                            className="bg-sol-indigo hover:bg-sol-indigo/90 text-white font-bold gap-2 rounded-xl shadow-lg shadow-sol-indigo/20"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                            Enable Auto-Pay
                        </Button>
                    )}

                    {isApproved && (
                        <div className="flex items-center gap-2 text-secondary-500 font-bold bg-secondary-50 px-4 py-2 rounded-xl border border-secondary-100">
                            <CheckCircle2 size={18} />
                            Auto-Pay Active
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-text-400 uppercase tracking-wider mb-2">Monthly Rent</p>
                        <p className="text-xl font-bold text-primary-900">{lease.monthlyRent} {lease.stablecoin}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-400 uppercase tracking-wider mb-2">Start Date</p>
                        <p className="text-xl font-bold text-primary-900">{new Date(lease.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-400 uppercase tracking-wider mb-2">Lease Status</p>
                        <div className="inline-flex px-3 py-1 rounded-full bg-secondary-500/10 text-secondary-500 text-xs font-bold uppercase">
                            {lease.status}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};