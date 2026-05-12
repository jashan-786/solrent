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
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = buildingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: validation.error.issues[0]?.message || "Invalid building data",
            }, { status: 400 });
        }

        // Strip landlordId from data if it exists to avoid type conflict with session.id
        const { landlordId, id, ...dataToCreate } = validation.data;

        const building = await prisma.building.create({
            data: {
                ...dataToCreate,
                landlordId: session.id
            },
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
