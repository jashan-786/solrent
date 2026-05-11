import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { signJWT } from "@/lib/auth";
import { PublicKey } from "@solana/web3.js";

const registerSchema = z.object({
    code: z.string().min(1, "Invite code is required"),
    walletAddress: z.string().min(32).max(44),
    signature: z.array(z.number()),
    message: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
        }

        const { code, walletAddress, signature, message, name, email } = validation.data;

        // Strict Solana wallet validation
        try {
            const pubKey = new PublicKey(walletAddress);
            if (!PublicKey.isOnCurve(pubKey.toBytes())) {
                throw new Error("Wallet address must be a valid user account (on-curve)");
            }
        } catch (e: any) {
            return NextResponse.json({ 
                success: false, 
                message: e.message || "Invalid Solana wallet address" 
            }, { status: 400 });
        }

        const signatureUint8 = new Uint8Array(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const pubKeyUint8 = bs58.decode(walletAddress);

        const isValidSignature = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
        if (!isValidSignature) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
        }

        if (!message.includes(code)) {
            return NextResponse.json({ success: false, message: "Signature message does not contain the invite code" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const invite = await tx.inviteCode.findUnique({ where: { code } });
            if (!invite || invite.isUsed) throw new Error("Invalid or used invite code");

            const existingUser = await tx.user.findFirst({
                where: { OR: [{ email }, { walletAddress }] }
            });
            if (existingUser) throw new Error("User with this email or wallet already exists");

            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    walletAddress,
                    role: "TENANT",
                    landlordBuildingId: invite.buildingId,
                }
            });

            await tx.inviteCode.update({
                where: { id: invite.id },
                data: {
                    isUsed: true,
                    usedById: newUser.id
                }
            });

            return newUser;
        });

        const token = await signJWT({
            id: result.id,
            walletAddress: result.walletAddress!,
            role: result.role,
            buildingId: result.landlordBuildingId
        });

        const response = NextResponse.json({
            success: true,
            message: "User registered successfully",
            user: result
        }, { status: 201 });

        response.cookies.set({
            name: "auth-token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return response;

    } catch (error: any) {
        
        return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
    }
}
