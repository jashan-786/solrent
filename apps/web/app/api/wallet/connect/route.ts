import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const connectWalletSchema = z.object({
    userId: z.string().cuid("User ID is required"),
    walletAddress: z.string().min(32, "Invalid Solana wallet address").max(44, "Invalid Solana wallet address"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = connectWalletSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid payload",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const { userId, walletAddress } = validation.data;

        // Check if the wallet address is already linked to another account
        const existingWallet = await prisma.user.findUnique({
            where: { walletAddress }
        });

        if (existingWallet && existingWallet.id !== userId) {
            return NextResponse.json({
                success: false,
                message: "This wallet address is already linked to another account",
            }, { status: 409 });
        }

        // Update the user with the new wallet address
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { walletAddress },
            select: { id: true, name: true, walletAddress: true, role: true }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Wallet connected successfully",
            user: updatedUser 
        }, { status: 200 });

    } catch (error) {
        console.error("Error connecting wallet:", error);
        return NextResponse.json({ success: false, message: "Error connecting wallet" }, { status: 500 });
    }
}
