import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== "TENANT") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

