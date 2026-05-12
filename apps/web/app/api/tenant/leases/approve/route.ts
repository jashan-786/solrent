import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const approveLeaseSchema = z.object({
    leaseId: z.string().cuid("Valid lease ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "TENANT") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = approveLeaseSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid request",
                errors: validation.error.format(),
            }, { status: 400 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id: validation.data.leaseId,
                tenantId: session.id,
            },
        });

        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        if (!lease.leaseDocumentUrl) {
            return NextResponse.json({
                success: false,
                message: "Cannot accept lease terms without an attached lease document",
            }, { status: 400 });
        }

        if (lease.status !== "PENDING") {
            return NextResponse.json({
                success: false,
                message: "This lease has already been processed or is not in a pending state.",
            }, { status: 400 });
        }

        const updated = await prisma.lease.update({
            where: { id: lease.id },
            data: { status: "ACTIVE" },
        });

        await prisma.payment.create({
            data: {
                leaseId: updated.id,
                buildingId: updated.buildingId,
                amount: updated.monthlyRent,
                stablecoin: updated.stablecoin,
                dueDate: updated.startDate, 
                status: "UPCOMING",
            },
        });

        return NextResponse.json({
            success: true,
            lease: {
                ...updated,
                onChainId: updated.onChainId?.toString() || null,
                nextDueTimestamp: updated.nextDueTimestamp?.toString() || null,
            },
        });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error approving lease" }, { status: 500 });
    }
}
