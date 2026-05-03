import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unitSchema } from "@/app/api/zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing unit id" }, { status: 400 });
        }

        const unit = await prisma.unit.findUnique({
            where: { id: id },
            include: {
                leases: {
                    include: { tenant: true }
                }
            }
        });

        if (!unit) {
            return NextResponse.json({ success: false, message: "Unit not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, unit }, { status: 200 });
    } catch (error) {
        console.error("Error fetching unit:", error);
        return NextResponse.json({ success: false, message: "Error fetching unit" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const validation = unitSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid unit data",
                errors: validation.error.format()
            }, { status: 400 });
        }

        const unit = await prisma.unit.update({
            where: { id: id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, unit });
    } catch (error) {
        console.error("Error updating unit:", error);
        return NextResponse.json({ success: false, message: "Error updating unit" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing unit id" }, { status: 400 });
        }

        await prisma.unit.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true, message: "Unit deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting unit:", error);
        return NextResponse.json({ success: false, message: "Error deleting unit" }, { status: 500 });
    }
}
