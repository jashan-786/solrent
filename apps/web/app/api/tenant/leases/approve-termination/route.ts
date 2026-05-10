import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const approveTerminationSchema = z.object({
    leaseId: z.string().cuid("Valid lease ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "TENANT") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = approveTerminationSchema.safeParse(body);
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

        if (lease.status !== "TERMINATION_REQUESTED") {
            return NextResponse.json({
                success: false,
                message: "Termination has not been requested for this lease",
            }, { status: 409 });
        }

        const updated = await prisma.lease.update({
            where: { id: lease.id },
            data: { status: "TERMINATED" },
        });

        await prisma.unit.update({
            where: { id: updated.unitId },
            data: { occupied: false },
        });

        return NextResponse.json({
            success: true,
            lease: {
                ...updated,
                onChainId: updated.onChainId?.toString() || null,
            },
        });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error approving termination" }, { status: 500 });
    }
}

