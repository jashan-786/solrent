import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { leaseId, enabled } = await req.json();

        if (!leaseId) {
            return NextResponse.json({ error: "Missing leaseId" }, { status: 400 });
        }

        const lease = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                autoPayEnabled: enabled,
                recurringApproved: enabled 
            }
        });

        return NextResponse.json({ success: true, lease });
    } catch (error) {
        
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
