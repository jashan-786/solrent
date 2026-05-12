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
            const currentDueDate = new Date(updatedPayment.dueDate);
            const nextDueDate = new Date(currentDueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);

            const nextDueSecs = Math.floor(nextDueDate.getTime() / 1000);

            await prisma.lease.update({
                where: { id: updatedPayment.leaseId },
                data: {
                    nextDueTimestamp: BigInt(nextDueSecs)
                }
            });

            // Check if next month's UPCOMING record already exists to avoid duplicates
            const existingNext = await prisma.payment.findFirst({
                where: {
                    leaseId: updatedPayment.leaseId,
                    status: "UPCOMING",
                    dueDate: {
                        gte: new Date(nextDueDate.getFullYear(), nextDueDate.getMonth(), 1),
                        lt: new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 1),
                    }
                }
            });

            if (!existingNext) {
                await prisma.payment.create({
                    data: {
                        leaseId: updatedPayment.leaseId,
                        buildingId: updatedPayment.buildingId,
                        amount: updatedPayment.lease.monthlyRent,
                        status: "UPCOMING",
                        dueDate: nextDueDate,
                        stablecoin: updatedPayment.lease.stablecoin || "USDC",
                    }
                });
            }
        }

        return NextResponse.json({ success: true, payment: updatedPayment });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error confirming payment" }, { status: 500 });
    }
}
