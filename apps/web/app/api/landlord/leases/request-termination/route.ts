import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
    leaseId: z.string().cuid("Valid lease ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = requestSchema.safeParse(body);
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
                building: { landlordId: session.id },
            },
            include: {
                unit: true,
                tenant: true,
                building: true,
            },
        });

        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        if (lease.status === "TERMINATED") {
            return NextResponse.json({ success: false, message: "Lease is already terminated" }, { status: 409 });
        }

        if (lease.status === "TERMINATION_REQUESTED") {
            return NextResponse.json({ success: false, message: "Termination already requested" }, { status: 409 });
        }

        await prisma.$transaction([
            prisma.lease.update({
                where: { id: lease.id },
                data: { status: "TERMINATION_REQUESTED" },
            }),
            prisma.payment.deleteMany({
                where: {
                    leaseId: lease.id,
                    status: { in: ["UPCOMING", "OVERDUE"] }
                }
            })
        ]);

        await prisma.notification.create({
            data: {
                userId: lease.tenantId,
                title: "Lease Termination Requested",
                message: `Your landlord requested to terminate the lease for Unit ${lease.unit.unitNumber}. Please review and approve termination in your lease page.`,
                type: "MESSAGE",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Termination requested and future payments cleared",
        });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error requesting termination" }, { status: 500 });
    }
}

