import { getSession } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildingSchema } from "../../zod";

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
        const buildings = await prisma.building.findMany({
            where: {
                landlordId: landlordId
            }
        });

        return NextResponse.json({
            success: true,
            buildings,
        });
    } catch (error) {
        
        return NextResponse.json({
            success: false,
            message: "Error fetching buildings",
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const validation = buildingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid building data",
            }, { status: 400 });
        }
        const building = await prisma.building.create({
            data: validation.data,
        });
        return NextResponse.json({
            success: true,
            building,
        });
    } catch (error) {
        
        return NextResponse.json({
            success: false,
            message: "Error creating building",
        }, { status: 500 });
    }
}

