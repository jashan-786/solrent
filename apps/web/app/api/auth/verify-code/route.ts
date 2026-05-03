import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyCodeSchema = z.object({
    code: z.string().min(1, "Invite code is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = verifyCodeSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
        }

        const { code } = validation.data;

        const invite = await prisma.inviteCode.findUnique({
            where: { code },
            include: { building: true, unit: true }
        });

        if (!invite) {
            return NextResponse.json({ success: false, message: "Invalid invite code" }, { status: 404 });
        }

        if (invite.isUsed) {
            return NextResponse.json({ success: false, message: "This invite code has already been used" }, { status: 403 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Code is valid", 
            buildingId: invite.buildingId,
            unitId: invite.unitId 
        }, { status: 200 });

    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
