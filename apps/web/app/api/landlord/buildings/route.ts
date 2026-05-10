import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {


    try {
        const building = await prisma.building.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                units: {
                    select: {
                        id: true,
                        unitNumber: true,
                    }
                }
            }
        })
        return NextResponse.json({
            success: true,
            data: building
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch building"
        })
    }
}
