import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaseSchema } from "@/app/api/zod";
import { getSession } from "@/lib/auth";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id,
                ...(session.role === "TENANT" ? { tenantId: session.id } : {}),
                ...(session.role === "LANDLORD" ? { building: { landlordId: session.id } } : {}),
            },
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

        const effectiveStatus = getEffectiveLeaseStatus(lease.status, lease.endDate);
        const serializedLease = {
            ...lease,
            status: effectiveStatus,
            onChainId: lease.onChainId?.toString() || null,
        };

        return NextResponse.json({ success: true, lease: serializedLease }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching lease" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

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

        const existing = await prisma.lease.findFirst({
            where: {
                id,
                building: { landlordId: session.id },
            },
        });
        if (!existing) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        const lease = await prisma.lease.update({
            where: { id: id },
            data: validation.data,
        });

        const serializedLease = {
            ...lease,
            onChainId: lease.onChainId?.toString() || null,
        };

        return NextResponse.json({ success: true, lease: serializedLease }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error updating lease" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Only landlords can delete leases" }, { status: 403 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const existing = await prisma.lease.findFirst({
            where: {
                id,
                building: { landlordId: session.id },
            },
        });

        if (!existing) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        if (existing.status !== "TERMINATED") {
            return NextResponse.json({
                success: false,
                message: "Lease cannot be deleted until the tenant approves termination.",
            }, { status: 409 });
        }

        const lease = await prisma.lease.delete({
            where: { id }
        });

        await prisma.unit.update({
            where: { id: lease.unitId },
            data: { occupied: false }
        });

        return NextResponse.json({ success: true, message: "Lease deleted successfully" }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error deleting lease" }, { status: 500 });
    }
}
