import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/app/api/zod";

export async function GET(req: NextRequest) {
    try {
        const leaseId = req.nextUrl.searchParams.get("leaseId");
        
        let filter: any = {};
        if (leaseId) filter.leaseId = leaseId;

        const payments = await prisma.payment.findMany({
            where: filter,
            orderBy: { dueDate: 'desc' }
        });

        return NextResponse.json({ success: true, payments }, { status: 200 });
    } catch (error) {
        console.error("Error fetching payments:", error);
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

        const payment = await prisma.payment.create({
            data: validation.data,
        });

        return NextResponse.json({ success: true, payment }, { status: 201 });
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json({ success: false, message: "Error creating payment" }, { status: 500 });
    }
}
