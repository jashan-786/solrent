import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, priority, buildingId, unitId } = body;

        if (!title || !description || !buildingId || !unitId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const request = await prisma.maintenanceRequest.create({
            data: {
                tenantId,
                unitId,
                buildingId,
                title,
                description,
                priority: priority || "LOW",
                status: "OPEN"
            }
        });

        const building = await prisma.building.findUnique({ where: { id: buildingId } });
        if (building?.landlordId) {
            await prisma.notification.create({
                data: {
                    userId: building.landlordId,
                    title: "New Maintenance Request",
                    message: `Tenant has requested maintenance: ${title}`,
                    type: "MESSAGE"
                }
            });
        }

        return NextResponse.json({ success: true, request });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const requests = await prisma.maintenanceRequest.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                unit: true,
                building: true
            }
        });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
