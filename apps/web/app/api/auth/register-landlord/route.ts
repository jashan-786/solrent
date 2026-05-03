import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { signJWT } from "@/lib/auth";

const registerSchema = z.object({
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

        const { walletAddress, signature, message, name, email } = validation.data;

        // 1. Verify Signature (SIWS)
        const signatureUint8 = new Uint8Array(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const pubKeyUint8 = bs58.decode(walletAddress);
        
        const isValidSignature = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
        if (!isValidSignature) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
        }

        // 2. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { walletAddress }] }
        });
        if (existingUser) {
            return NextResponse.json({ success: false, message: "User with this email or wallet already exists" }, { status: 400 });
        }

        // 3. Create Landlord User
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                walletAddress,
                role: "LANDLORD",
            }
        });

        // 4. Generate a session cookie (JWT)
        const token = await signJWT({
            id: newUser.id,
            walletAddress: newUser.walletAddress!,
            role: newUser.role,
        });

        const response = NextResponse.json({ 
            success: true, 
            message: "Landlord registered successfully", 
            user: {
                id: newUser.id,
                name: newUser.name,
                role: newUser.role
            } 
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
        console.error("Error registering landlord:", error);
        return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
    }
}
