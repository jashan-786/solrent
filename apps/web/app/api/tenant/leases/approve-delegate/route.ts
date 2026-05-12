import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const approveDelegatePayload = z.object({
    leaseId: z.string().cuid("Lease ID is required"),
    transactionHash: z.string().min(1, "Transaction hash is required"),
    enabled: z.boolean(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "TENANT") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = approveDelegatePayload.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.format(),
            }, { status: 400 });
        }

        const { leaseId, transactionHash, enabled } = validation.data;

        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                tenantId: session.id,
                status: { in: ["ACTIVE", "PENDING"] },
            },
        });

        if (!lease) {
            return NextResponse.json({
                success: false,
                message: "Lease not found or not owned by you",
            }, { status: 404 });
        }

        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                recurringApproved: enabled,
                autoPayEnabled: enabled,
            },
        });

        await prisma.notification.create({
            data: {
                userId: session.id,
                title: enabled ? "Auto-Pay Enabled" : "Auto-Pay Disabled",
                message: enabled 
                    ? `Auto-pay has been enabled for your lease. Rent will be automatically deducted from your wallet.`
                    : `Auto-pay has been disabled. You must now manually pay rent each month.`,
                type: "PAYMENT_SUCCESS",
            },
        });

        return NextResponse.json({
            success: true,
            message: `Auto-pay ${enabled ? 'enabled' : 'disabled'} successfully`,
        });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
