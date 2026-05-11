import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const buildings = await prisma.building.findMany({
            where: { landlordId: session.id },
            include: {
                _count: {
                    select: { units: true }
                },
                units: {
                    select: {
                        occupied: true,
                        rentAmount: true,
                    }
                }
            }
        });

        const mappedBuildings = buildings.map(b => {
            const totalUnits = b._count.units;
            const occupiedUnits = b.units.filter(u => u.occupied).length;
            const monthlyYield = b.units.reduce((sum, u) => sum + (u.occupied ? u.rentAmount : 0), 0);

            return {
                id: b.id,
                name: b.name,
                address: b.address,
                city: b.city,
                province: b.province,
                postalCode: b.postalCode,
                landlordId: b.landlordId,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
                units: totalUnits,
                occupied: occupiedUnits,
                monthlyyield: b.units.reduce((sum, u) => sum + u.rentAmount, 0),
                actualYield: monthlyYield,
                img: "/building-landing.png"
            };
        });

        const totalMonthlyRevenue = mappedBuildings.reduce((sum, b) => sum + (Number(b.monthlyyield) || 0), 0);
        const totalOccupied = mappedBuildings.reduce((sum, b) => sum + (Number(b.occupied) || 0), 0);
        const totalUnitsAll = mappedBuildings.reduce((sum, b) => sum + (Number(b.units) || 0), 0);
        const occupancyRate = totalUnitsAll === 0 ? 0 : (totalOccupied / totalUnitsAll) * 100;

        return NextResponse.json({
            success: true,
            totalBuildings: mappedBuildings.length,
            monthlyRevenue: totalMonthlyRevenue,
            occupancyRate: occupancyRate.toFixed(1),
            buildings: mappedBuildings
        });

    } catch (error) {

        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, address, city, province, postalCode } = body;

        if (!name || !address || !city) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const newBuilding = await prisma.building.create({
            data: {
                name,
                address,
                city,
                province: province || "",
                postalCode: postalCode || "",
                landlordId: session.id
            }
        });

        return NextResponse.json({ success: true, building: newBuilding }, { status: 201 });

    } catch (error) {

        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
