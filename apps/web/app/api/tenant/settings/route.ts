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
                tenantLeases: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    select: {
                        id: true,
                        leaseDocumentUrl: true,
                        onChainAddress: true,
                        leaseNftMint: true,
                        startDate: true,
                    }
                }
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

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
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
