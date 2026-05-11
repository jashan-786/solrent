import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                walletAddress: true,
                role: true,
                avatarUrl: true,
                preferredCoin: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching settings" }, { status: 500 });
    }
}

import { userSchema } from "@/app/api/zod";

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        // Validate partial update
        const validation = userSchema.partial().safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                success: false, 
                message: "Validation failed", 
                errors: validation.error.format() 
            }, { status: 400 });
        }

        const { name, email, phone, walletAddress } = validation.data;

        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(walletAddress && { walletAddress }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                walletAddress: true,
                role: true,
                avatarUrl: true,
                preferredCoin: true,
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error updating settings" }, { status: 500 });
    }
}