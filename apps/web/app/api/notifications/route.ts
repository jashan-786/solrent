import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notificationSchema = z.object({
    userId: z.string().cuid("User ID is required"),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    type: z.enum(["PAYMENT_SUCCESS", "PAYMENT_FAILED", "RENT_DUE", "LEASE_CREATED", "MESSAGE"]),
});

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const userId = session?.id;

        if (!userId) {
            return NextResponse.json({ success: false, message: "userId query parameter is required" }, { status: 400 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, notifications }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching notifications" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = notificationSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid notification data",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: validation.data,
        });

        return NextResponse.json({ success: true, notification }, { status: 201 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error creating notification" }, { status: 500 });
    }
}
