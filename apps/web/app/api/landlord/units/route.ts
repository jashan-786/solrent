import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unitSchema } from "@/app/api/zod";

export async function GET(req: NextRequest) {
    const buildingId = req.nextUrl.searchParams.get("buildingId");

    if (!buildingId) {
        return NextResponse.json({
            success: false,
            message: "buildingId query parameter is required",
        }, { status: 400 });
    }

    try {
        const units = await prisma.unit.findMany({
            where: {
                buildingId: buildingId
            },
            include: {
                leases: {
                    where: { status: "ACTIVE" },
                    include: { tenant: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            units,
        });
    } catch (error) {
        console.error("Error fetching units:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching units",
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = unitSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid unit data",
                errors: validation.error.format()
            }, { status: 400 });
        }
        
        const unit = await prisma.unit.create({
            data: validation.data,
        });
        
        return NextResponse.json({
            success: true,
            unit,
        });
    } catch (error) {
        console.error("Error creating unit:", error);
        return NextResponse.json({
            success: false,
            message: "Error creating unit",
        }, { status: 500 });
    }
}
