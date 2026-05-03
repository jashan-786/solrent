import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaseStatus } from "@prisma/client";


export async function GET(req: NextRequest) {

    try {
        const session = await getSession();
        const landlordId = session?.role === "LANDLORD" ? session?.id : null;
        const tenantId = session?.role === "TENANT" ? session?.id : null;
        const buildingId = req.nextUrl.searchParams.get("buildingId");

        let filter: any = {};

        if (landlordId) filter.landlordId = landlordId;
        if (buildingId) filter.unit = { buildingId: buildingId };
        if (tenantId) filter.tenantId = tenantId;

        const leases = await prisma.lease.findMany({
            where: filter,
            include: {
                unit: {
                    include: {
                        building: true,
                    }
                },
                tenant: true,
            }
        });

        return NextResponse.json({
            success: true,
            leases,
        });
    } catch (error) {
        console.error("Error fetching leases:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching leases",
        }, { status: 500 });
    }
}



export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (session?.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }
        const body = await req.json();

        const { tenantId, unitId, monthlyRent, depositAmount, stablecoin, startDate, endDate, autoPayEnabled, leaseDocumentUrl } = body;

        const lease = await prisma.lease.create({
            data: {
                tenantId,
                unitId,
                monthlyRent,
                depositAmount,
                stablecoin,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                autoPayEnabled,
                leaseDocumentUrl,
                status: LeaseStatus.PENDING, // Start as pending
            }
        });

        // Update unit as occupied
        await prisma.unit.update({
            where: { id: unitId },
            data: { occupied: true },
        });

        return NextResponse.json({
            success: true,
            lease,
        });
    } catch (error) {
        console.error("Error creating lease:", error);
        return NextResponse.json({
            success: false,
            message: "Error creating lease",
        }, { status: 500 });
    }
}