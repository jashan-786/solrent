import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/app/api/zod";
import { PaymentStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const leaseId = req.nextUrl.searchParams.get("leaseId");
        const buildingId = req.nextUrl.searchParams.get("buildingId");

        if (!buildingId || !leaseId) {
            return NextResponse.json({ success: false, message: "Building ID and Lease ID are required" }, { status: 400 });
        }

        const payments = await prisma.payment.findMany({
            where: { leaseId: leaseId, buildingId: buildingId },
            include: {
                building: { select: { id: true, name: true, } },
                lease: {
                    select: {
                        id: true,
                        tenant: { select: { id: true, name: true, email: true, } },
                    }
                },
            },
            orderBy: { dueDate: 'desc' }
        });

        const totalVolume = await prisma.payment.aggregate({
            where: { buildingId: buildingId, leaseId: leaseId },
            _sum: { amount: true },
        });
        const pendingSettlements = await prisma.payment.count({
            where: { buildingId: buildingId, leaseId: leaseId, status: PaymentStatus.UPCOMING },
        });
        const failedTransfers = await prisma.payment.count({
            where: { buildingId: buildingId, leaseId: leaseId, status: PaymentStatus.FAILED },
        });
        const totalPaid = await prisma.payment.count({
            where: { buildingId: buildingId, leaseId: leaseId, status: PaymentStatus.COMPLETED },
        });

        const total = await prisma.payment.count({ where: { buildingId: buildingId, leaseId: leaseId } });

        const percentage = total ? (totalPaid / total) * 100 : 0;

        return NextResponse.json({ success: true, payments, totalVolume, pendingSettlements, failedTransfers, totalPaid, percentage, total }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching payments" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = paymentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid payment data",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const building = await prisma.building.findUnique({ where: { id: validation.data.buildingId, landlordId: session.id } });
        if (!building) {
            return NextResponse.json({ success: false, message: "Building not found" }, { status: 404 });
        }

        const lease = await prisma.lease.findUnique({ where: { id: validation.data.leaseId, buildingId: building.id } });
        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        const payment = await prisma.payment.create({
            data: {
                leaseId: validation.data.leaseId,
                buildingId: validation.data.buildingId,
                amount: validation.data.amount,
                stablecoin: validation.data.stablecoin,
                dueDate: new Date(validation.data.dueDate),
                status: validation.data.status,
            },
        });

        return NextResponse.json({ success: true, payment }, { status: 201 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error creating payment" }, { status: 500 });
    }
}
