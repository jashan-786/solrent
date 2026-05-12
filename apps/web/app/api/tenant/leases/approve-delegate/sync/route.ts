import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { leaseId, enabled } = await req.json();

        if (!leaseId) {
            return NextResponse.json({ error: "Missing leaseId" }, { status: 400 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                tenantId: session.id
            }
        });

        if (!lease) {
            return NextResponse.json({ error: "Lease not found or unauthorized" }, { status: 404 });
        }

        const updated = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                autoPayEnabled: enabled,
                recurringApproved: enabled
            }
        });

        const safeLease = {
            ...updated,
            onChainId: updated.onChainId?.toString(),
            nextDueTimestamp: updated.nextDueTimestamp?.toString()
        };

        return NextResponse.json({ success: true, lease: safeLease });
    } catch (error) {
        console.error("[ApproveDelegateSync] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
