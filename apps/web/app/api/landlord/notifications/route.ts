import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        const landlordId = session?.id;

        if (!landlordId || session?.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: landlordId },
            orderBy: { createdAt: 'desc' }
        });

        await prisma.notification.updateMany({
            where: { userId: landlordId, isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true, notifications }, { status: 200 });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
