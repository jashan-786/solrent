import { NextRequest, NextResponse } from "next/server";
import { createMint } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { getSession } from "@/lib/auth";
import { canCreateDevTestUsdcMint } from "@/lib/dev-api-auth";
import { loadFaucetKeypairFromEnv } from "@/lib/load-faucet-keypair";

export async function POST(_req: NextRequest) {
    try {
        const session = await getSession();
        if (!canCreateDevTestUsdcMint(_req, session)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const rpc = process.env.SOLANA_DEVNET_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL;
        if (!rpc || !rpc.toLowerCase().includes("devnet")) {
            return NextResponse.json({ success: false, message: "Devnet RPC not configured" }, { status: 500 });
        }

        const loaded = loadFaucetKeypairFromEnv();
        if (!loaded.ok) {
            return NextResponse.json({ success: false, message: loaded.message }, { status: 500 });
        }
        const server = loaded.keypair;

        const connection = new Connection(rpc, "confirmed");

        const mint = await createMint(
            connection,
            server,               
            server.publicKey,     
            server.publicKey,     
            6                     
        );

        return NextResponse.json({
            success: true,
            mint: mint.toBase58(),
            message:
                "Set SOLANA_TEST_USDC_MINT and NEXT_PUBLIC_USDC_DEVNET_MINT to this mint address, then restart dev server.",
        });
    } catch (error: any) {
        
        return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
    }
}

