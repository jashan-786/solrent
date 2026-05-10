import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getStablecoinMint } from "@repo/anchor";

const generateCodeSchema = z.object({
    buildingId: z.string(),
    unitId: z.string().optional().nullable(),
});

function generateRandomCode(prefix: string = "INV") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = generateCodeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid payload",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const session = await getSession();
        const landlordId = session?.id;
        const { buildingId, unitId } = validation.data;

        const landlord = await prisma.user.findUnique({
            where: { id: landlordId }
        });

        if (!landlord || !landlord.walletAddress) {
            return NextResponse.json({
                success: false,
                message: "Landlord wallet not verified. Please connect and verify your wallet on the dashboard first."
            }, { status: 403 });
        }

        try {
            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
            const connection = new Connection(rpcUrl);
            const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: rpcUrl });
            const ata = await getAssociatedTokenAddress(usdcMint, new PublicKey(landlord.walletAddress));
            const info = await connection.getAccountInfo(ata);

            if (!info) {
                return NextResponse.json({
                    success: false,
                    message: "Landlord USDC account not initialized. Please click 'Complete Setup' on your dashboard."
                }, { status: 403 });
            }
        } catch (e) {


            return NextResponse.json({
                success: false,
                message: "Failed to verify wallet status. Please try again later."
            }, { status: 500 });
        }

        const building = await prisma.building.findFirst({
            where: {
                id: buildingId,
                landlordId: landlordId
            }
        });

        if (!building) {
            return NextResponse.json({ success: false, message: "Building not found or you do not have permission" }, { status: 403 });
        }

        const codePrefix = building.name.substring(0, 3).toUpperCase() || "INV";
        const newCode = generateRandomCode(codePrefix);

        const inviteCode = await prisma.inviteCode.create({
            data: {
                code: newCode,
                buildingId: building.id,
                unitId: unitId || null,
                isUsed: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "Invite code generated",
            inviteCode: inviteCode.code
        }, { status: 201 });

    } catch (error) {

        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const buildingId = req.nextUrl.searchParams.get("buildingId");

        if (!buildingId) {
            return NextResponse.json({ success: false, message: "buildingId is required" }, { status: 400 });
        }

        const codes = await prisma.inviteCode.findMany({
            where: { buildingId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, codes }, { status: 200 });

    } catch (error) {

        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
