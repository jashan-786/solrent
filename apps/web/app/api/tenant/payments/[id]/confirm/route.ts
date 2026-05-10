import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: paymentId } = await params;
        const session = await getSession();
        
        if (!session || session.role !== "TENANT") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { transactionHash, nftReceiptMint } = body;

        if (!transactionHash) {
            return NextResponse.json({ success: false, message: "Transaction hash is required" }, { status: 400 });
        }

        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "COMPLETED",
                transactionHash,
                nftReceiptMint,
                paidAt: new Date()
            }
        });

        return NextResponse.json({ success: true, payment: updatedPayment });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error confirming payment" }, { status: 500 });
    }
}
