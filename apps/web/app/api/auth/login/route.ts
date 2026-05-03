import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { signJWT } from "@/lib/auth";

const loginSchema = z.object({
    walletAddress: z.string().min(32).max(44),
    signature: z.array(z.number()),
    message: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
        }

        const { walletAddress, signature, message } = validation.data;

        // 1. Verify User Exists First
        const user = await prisma.user.findUnique({
            where: { walletAddress }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Account not found. Please enter an Invitation Code to register." }, { status: 404 });
        }

        // 2. Verify Signature (SIWS)
        const signatureUint8 = new Uint8Array(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const pubKeyUint8 = bs58.decode(walletAddress);
        
        const isValidSignature = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
        if (!isValidSignature) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
        }

        // 3. Generate a session cookie (JWT)
        const token = await signJWT({
            id: user.id,
            walletAddress: user.walletAddress!,
            role: user.role,
            buildingId: user.landlordBuildingId
        });

        // Set the cookie on the response
        const response = NextResponse.json({ 
            success: true, 
            message: "Login successful", 
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                buildingId: user.landlordBuildingId
            }
        }, { status: 200 });

        response.cookies.set({
            name: "auth-token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return response;

    } catch (error) {
        console.error("Error logging in:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
