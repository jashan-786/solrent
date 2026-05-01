
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const buildingSchema = z.object({
    id: z.string().optional(),
    image: z.string().url("Invalid URL").optional(),
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().min(1, "Postal Code is required"),
    landlordId: z.string().min(1, "Landlord ID is required"),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
});


export async function GET(req: NextRequest) {
    // left with auth logic
    const landlordId = req.nextUrl.searchParams.get("landlordId");

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
        console.error("Error fetching buildings:", error);
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
        console.error("Error creating building:", error);
        return NextResponse.json({
            success: false,
            message: "Error creating building",
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {


    try {
        const body = await req.json();
        const validation = buildingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid building data",
            }, { status: 400 });
        }
        const building = await prisma.building.update({
            where: {
                id: validation.data.id,
            },
            data: validation.data,
        });
        return NextResponse.json({
            success: true,
            building,
        });




    } catch (error) {
        console.error("Error updating building:", error);
        return NextResponse.json({
            success: false,
            message: "Error updating building",
        }, { status: 500 });
    }



}