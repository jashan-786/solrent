import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { AnchorProvider, Program, Idl, BN, Wallet } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { loadFaucetKeypairFromEnv } from "@/lib/load-faucet-keypair";
import {
    getLeasePDA,
    getDelegatePDA,
    getMetadataPDA,
    getMasterEditionPDA,
    METAPLEX_PROGRAM_ID,
    getStablecoinMint,
    getStablecoinDecimals,
    idl
} from "@repo/anchor";

export async function GET(req: NextRequest) {

    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const botKeypairResult = loadFaucetKeypairFromEnv();
        if (!botKeypairResult.ok) {
            return NextResponse.json({ success: false, message: "Bot keypair not configured" }, { status: 500 });
        }
        const botKeypair = botKeypairResult.keypair;

        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
        const connection = new Connection(rpcUrl, "confirmed");

        const now = Math.floor(Date.now() / 1000);
        const dueLeases = await prisma.lease.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { nextDueTimestamp: { lte: BigInt(now) } },
                    {
                        nextDueTimestamp: null,
                        startDate: { lte: new Date() }
                    }
                ]
            },
            include: {
                tenant: true,
                unit: {
                    include: {
                        building: {
                            include: { landlord: true }
                        }
                    }
                }
            }
        });

        if (dueLeases.length === 0) {
            return NextResponse.json({ success: true, message: "No leases due for collection" });
        }


        const dummyWallet = {
            signTransaction: async (tx: Transaction) => {
                tx.partialSign(botKeypair);
                return tx;
            },
            signAllTransactions: async (txs: Transaction[]) => {
                txs.forEach(t => t.partialSign(botKeypair));
                return txs;
            },
            publicKey: botKeypair.publicKey
        } as unknown as Wallet;

        const provider = new AnchorProvider(connection, dummyWallet, { commitment: "confirmed" });
        const program = new Program(idl as Idl, provider) as any;

        const results = [];

        for (const lease of dueLeases) {
            try {
                if (!lease.tenant.walletAddress || !lease.unit.building.landlord.walletAddress) {
                    throw new Error("Missing wallet addresses for tenant or landlord");
                }

                const landlordPubkey = new PublicKey(lease.unit.building.landlord.walletAddress);
                const tenantPubkey = new PublicKey(lease.tenant.walletAddress);
                const onChainId = BigInt(lease.onChainId || 0);

                const [leasePDA] = getLeasePDA(landlordPubkey, tenantPubkey, onChainId);
                const [delegatePDA] = getDelegatePDA(leasePDA, onChainId);

                const STABLECOIN_MINT = getStablecoinMint(lease.stablecoin as any, { rpcEndpoint: rpcUrl });
                const tenantAta = await getAssociatedTokenAddress(STABLECOIN_MINT, tenantPubkey);
                const landlordAta = await getAssociatedTokenAddress(STABLECOIN_MINT, landlordPubkey);

                const nftMint = Keypair.generate();
                const nftTokenAccount = await getAssociatedTokenAddress(nftMint.publicKey, tenantPubkey);
                const [metadataPDA] = getMetadataPDA(nftMint.publicKey);
                const [masterEditionPDA] = getMasterEditionPDA(nftMint.publicKey);

                const tx = new Transaction();
                const landlordAtaInfo = await connection.getAccountInfo(landlordAta);
                if (!landlordAtaInfo) {
                    tx.add(createAssociatedTokenAccountInstruction(botKeypair.publicKey, landlordAta, landlordPubkey, STABLECOIN_MINT));
                }

                const decimals = getStablecoinDecimals(lease.stablecoin as any);
                const amountInBaseUnits = new BN(lease.monthlyRent).mul(new BN(10).pow(new BN(decimals)));

                const executePaymentIx = await program.methods
                    .executePayment(new BN(onChainId.toString()), amountInBaseUnits)
                    .accounts({
                        payer: botKeypair.publicKey,
                        landlord: landlordPubkey,
                        tenant: tenantPubkey,
                        landlordAta: landlordAta,
                        tenantAta: tenantAta,
                        lease: leasePDA,
                        delegate: delegatePDA,
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

                tx.add(executePaymentIx);
                const { blockhash } = await connection.getLatestBlockhash();
                tx.recentBlockhash = blockhash;
                tx.feePayer = botKeypair.publicKey;

                tx.partialSign(nftMint);
                tx.partialSign(botKeypair);

                const sig = await connection.sendRawTransaction(tx.serialize());
                await connection.confirmTransaction(sig, "confirmed");


                await prisma.payment.create({
                    data: {
                        leaseId: lease.id,
                        buildingId: lease.buildingId,
                        amount: lease.monthlyRent,
                        status: "COMPLETED",
                        transactionHash: sig,
                        nftReceiptMint: nftMint.publicKey.toBase58(),
                        dueDate: new Date(),
                        stablecoin: lease.stablecoin,
                    },
                });

                const currentDue = lease.nextDueTimestamp ? Number(lease.nextDueTimestamp) : Math.floor(new Date(lease.startDate).getTime() / 1000);
                const nextDue = BigInt(currentDue + 2592000);

                await prisma.lease.update({
                    where: { id: lease.id },
                    data: { nextDueTimestamp: nextDue },
                });

                results.push({ leaseId: lease.id, status: "SUCCESS", sig });

            } catch (err: any) {

                await prisma.payment.create({
                    data: {
                        leaseId: lease.id,
                        buildingId: lease.buildingId,
                        amount: lease.monthlyRent,
                        status: "FAILED",
                        dueDate: new Date(),
                        stablecoin: lease.stablecoin,
                        failureReason: err.message
                    },
                });
                results.push({ leaseId: lease.id, status: "FAILED", error: err.message });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error: any) {

        return NextResponse.json({ success: false, message: "Critical error in cron job" }, { status: 500 });
    }
}
