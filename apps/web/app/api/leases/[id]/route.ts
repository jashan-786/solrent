import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaseSchema } from "@/app/api/zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const lease = await prisma.lease.findUnique({
            where: { id: id },
            include: {
                unit: {
                    include: { building: true }
                },
                tenant: true,
                payments: true
            }
        });

        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, lease }, { status: 200 });
    } catch (error) {
        console.error("Error fetching lease:", error);
        return NextResponse.json({ success: false, message: "Error fetching lease" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const body = await req.json();
        const validation = leaseSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid lease data",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const lease = await prisma.lease.update({
            where: { id: id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, lease }, { status: 200 });
    } catch (error) {
        console.error("Error updating lease:", error);
        return NextResponse.json({ success: false, message: "Error updating lease" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const lease = await prisma.lease.delete({
            where: { id: id }
        });

        // Also update unit occupancy since lease is deleted
        await prisma.unit.update({
            where: { id: lease.unitId },
            data: { occupied: false }
        });

        return NextResponse.json({ success: true, message: "Lease deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting lease:", error);
        return NextResponse.json({ success: false, message: "Error deleting lease" }, { status: 500 });
    }
}
