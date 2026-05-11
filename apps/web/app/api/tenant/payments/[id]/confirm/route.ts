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
            },
            include: { lease: true }
        });

        // Advance the Lease milestone
        if (updatedPayment.lease) {
            const currentDue = updatedPayment.lease.nextDueTimestamp 
                ? Number(updatedPayment.lease.nextDueTimestamp) 
                : Math.floor(new Date().getTime() / 1000);
            
            const nextDueSecs = currentDue + 2592000;

            await prisma.lease.update({
                where: { id: updatedPayment.leaseId },
                data: {
                    nextDueTimestamp: BigInt(nextDueSecs)
                }
            });

            // Create next month's UPCOMING record
            await prisma.payment.create({
                data: {
                    leaseId: updatedPayment.leaseId,
                    buildingId: updatedPayment.buildingId,
                    amount: updatedPayment.lease.monthlyRent,
                    status: "UPCOMING",
                    dueDate: new Date(nextDueSecs * 1000),
                    stablecoin: updatedPayment.lease.stablecoin || "USDC",
                }
            });
        }

        return NextResponse.json({ success: true, payment: updatedPayment });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error confirming payment" }, { status: 500 });
    }
}
