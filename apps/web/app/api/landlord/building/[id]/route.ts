
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildingSchema } from "@/app/api/zod";
import { LeaseStatus } from "@prisma/client";

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
                        id: true,
                        unitNumber: true,
                        occupied: true,
                        rentAmount: true,
                        bedrooms: true,
                        bathrooms: true,
                        leases: {
                            where: { status: LeaseStatus.ACTIVE },
                            include: {
                                tenant: {
                                    select: { name: true, email: true, avatarUrl: true, walletAddress: true }
                                }
                            }
                        }
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
        const projectedYield = building.units.reduce((sum, u) => sum + u.rentAmount, 0);
        const actualYield = building.units.reduce((sum, u) => sum + (u.occupied ? u.rentAmount : 0), 0);

        // Clean mapping to avoid BigInt serialization issues
        const { units: rawUnits, ...buildingData } = building;
        
        const mappedBuilding = {
            ...buildingData,
            units: totalUnits,
            occupied: occupiedUnits,
            monthlyyield: projectedYield,
            actualYield,
            units_list: rawUnits.map(unit => ({
                ...unit,
                leases: unit.leases.map(lease => ({
                    ...lease,
                    onChainId: lease.onChainId?.toString() || null,
                    nextDueTimestamp: lease.nextDueTimestamp?.toString() || null,
                }))
            })),
            img: "/building-landing.png"
        };

        return NextResponse.json({
            success: true,
            building: mappedBuilding
        }, { status: 200 });

    } catch (error: any) {
        
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Error fetching the building",
                stack: error?.stack
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
        
        return NextResponse.json(
            {
                success: false,
                message: "Error deleting the building"
            },
            { status: 500 }
        )
    }
}  