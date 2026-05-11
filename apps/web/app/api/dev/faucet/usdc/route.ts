import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { getSession } from "@/lib/auth";
import { isDevApiBypassAuthorized } from "@/lib/dev-api-auth";
import { loadFaucetKeypairFromEnv } from "@/lib/load-faucet-keypair";
import { getStablecoinDecimals } from "@repo/anchor";

const payloadSchema = z.object({
    amount: z.number().positive().max(10_000).default(1000), 
    walletAddress: z.string().min(32).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, message: "Invalid request", errors: parsed.error.format() }, { status: 400 });
        }

        const session = await getSession();
        const devBypass = isDevApiBypassAuthorized(req);
        
        // Prioritize explicitly provided wallet, fallback to session
        let userWallet: string | null = parsed.data.walletAddress || session?.walletAddress || null;
        
        if (!userWallet) {
            return NextResponse.json(
                {
                    success: false,
                    message: devBypass
                        ? "Provide walletAddress in JSON body for faucet when not logged in."
                        : "Log in with a wallet-linked account or call with dev bypass + walletAddress.",
                },
                { status: 401 },
            );
        }

        const rpc = process.env.SOLANA_DEVNET_RPC_URL || 
                    process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL || 
                    process.env.NEXT_PUBLIC_RPC_URL ||
                    "https://api.devnet.solana.com";

        if (!rpc.toLowerCase().includes("devnet") && !rpc.toLowerCase().includes("api.devnet")) {
            return NextResponse.json({ success: false, message: "Devnet RPC not configured correctly" }, { status: 500 });
        }

        const loaded = loadFaucetKeypairFromEnv();
        if (!loaded.ok) {
            return NextResponse.json({ success: false, message: loaded.message }, { status: 500 });
        }
        const server = loaded.keypair;

        const configuredMint = process.env.SOLANA_TEST_USDC_MINT;
        if (!configuredMint) {
            return NextResponse.json({
                success: false,
                message: "Test USDC mint not configured. Call /api/dev/setup/test-usdc and set SOLANA_TEST_USDC_MINT + NEXT_PUBLIC_USDC_DEVNET_MINT.",
            }, { status: 500 });
        }

        const connection = new Connection(rpc, "confirmed");
        const mint = new PublicKey(configuredMint);
        const userPubkey = new PublicKey(userWallet);

        const userAta = await getOrCreateAssociatedTokenAccount(connection, server, mint, userPubkey);

        const stablecoinDecimals = getStablecoinDecimals("USDC", mint);
        const baseUnits = BigInt(Math.round(parsed.data.amount * (10 ** stablecoinDecimals)));
        const sig = await mintTo(connection, server, mint, userAta.address, server.publicKey, baseUnits);

        return NextResponse.json({
            success: true,
            signature: sig,
            mint: mint.toBase58(),
            userAta: userAta.address.toBase58(),
        });
    } catch (error: any) {
        
        return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
    }
}

