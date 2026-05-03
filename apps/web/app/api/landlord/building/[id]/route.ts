
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildingSchema } from "@/app/api/zod";



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        if (!id)
            return NextResponse.json(
                {
                    success: false,
                    message: "missing building id"
                },
                { status: 400 }
            )

        const building = await prisma.building.findUnique({
            where: { id },
            include: {
                _count: { select: { units: true } },
                units: {
                    select: {
                        occupied: true,
                        rentAmount: true,
                    }
                }
            }
        });

        if (!building) {
            return NextResponse.json({
                success: false,
                message: "Building not found"
            }, { status: 404 });
        }

        const totalUnits = building._count.units;
        const occupiedUnits = building.units.filter(u => u.occupied).length;
        const monthlyYield = building.units.reduce((sum, u) => sum + u.rentAmount, 0);

        const mappedBuilding = {
            ...building,
            units: totalUnits,
            occupied: occupiedUnits,
            monthlyyield: monthlyYield,
            img: "/building-landing.png"
        };

        return NextResponse.json({
            success: true,
            building: mappedBuilding
        }, { status: 200 });

    } catch (error) {
        console.log("Error fetching the building")
        NextResponse.json(
            {
                success: false,
                message: "Error fetching the building"
            },
            { status: 500 }
        )

    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

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
                id: id,
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



export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id: buildingId } = await params;
        if (!buildingId)
            return NextResponse.json({
                success: false,
                message: " missing building id"
            }, { status: 400 })

        const deletedBuilding = await prisma.building.delete(
            {
                where: {
                    id: buildingId
                }
            })

        if (!deletedBuilding)
            return NextResponse.json({
                success: false,
                message: "incorrect  building id"
            }, { status: 400 })

        else
            return NextResponse.json({
                success: true,
                message: " building delted"
            }, { status: 200 })

    } catch (error) {
        console.log("Error deleting the building")
        NextResponse.json(
            {
                success: false,
                message: "Error deleting the building"
            },
            { status: 500 }


        )

    }
}  