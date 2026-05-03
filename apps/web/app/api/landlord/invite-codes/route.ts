import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateCodeSchema = z.object({
    landlordId: z.string().cuid(),
    buildingId: z.string().cuid(),
    unitId: z.string().cuid().optional(),
});

// Helper function to generate a random code like "BLD-8X2A"
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

        // Verify the landlord owns this building
        const building = await prisma.building.findFirst({
            where: {
                id: buildingId,
                landlordId: landlordId
            }
        });

        if (!building) {
            return NextResponse.json({ success: false, message: "Building not found or you do not have permission" }, { status: 403 });
        }

        // Generate a unique code
        const codePrefix = building.name.substring(0, 3).toUpperCase() || "INV";
        const newCode = generateRandomCode(codePrefix);

        const inviteCode = await prisma.inviteCode.create({
            data: {
                code: newCode,
                buildingId: building.id,
                unitId: unitId,
                isUsed: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "Invite code generated",
            inviteCode: inviteCode.code
        }, { status: 201 });

    } catch (error) {
        console.error("Error generating invite code:", error);
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
        console.error("Error fetching invite codes:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
