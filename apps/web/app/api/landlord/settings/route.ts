import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {

    const session = await getSession();
    const landlordId = session?.id;

    if (!landlordId) {
        return NextResponse.json({
            success: false,
            message: "landlordId query parameter is required",
        }, { status: 400 });
    }

    try {
        const tenants = await prisma.user.findMany({
            where: {
                landlordId: landlordId
            }
        });

        return NextResponse.json({
            success: true,
            tenants,
        });
    } catch (error) {
        console.error("Error fetching tenants:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching tenants",
        }, { status: 500 });
    }
}