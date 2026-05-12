
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const syncPaymentPayload = z.object({
    leaseId: z.string().cuid(),
    transactionHash: z.string().optional(),
    amount: z.number(),
    status: z.enum(["COMPLETED", "FAILED"]),
    nftMint: z.string().optional(),
    error: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = syncPaymentPayload.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid sync data",
                errors: validation.error.format(),
            }, { status: 400 });
        }

        const { leaseId, transactionHash, amount, status, nftMint, error } = validation.data;

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { unit: true }
        });

        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }



        // Find the current upcoming payment to mark as completed
        const currentUpcoming = await prisma.payment.findFirst({
            where: {
                leaseId,
                status: "UPCOMING",
            },
            orderBy: { dueDate: "asc" }
        });

        if (status === "COMPLETED") {
            if (currentUpcoming) {
                // Update the existing milestone
                await prisma.payment.update({
                    where: { id: currentUpcoming.id },
                    data: {
                        status: "COMPLETED",
                        transactionHash: transactionHash || null,
                        nftReceiptMint: nftMint || null,
                        amount,
                        paidAt: new Date(),
                    }
                });
            } else {
                // Fallback: Create if somehow missing
                await prisma.payment.create({
                    data: {
                        leaseId,
                        buildingId: lease.buildingId,
                        amount,
                        status: "COMPLETED",
                        transactionHash: transactionHash || null,
                        nftReceiptMint: nftMint || null,
                        dueDate: new Date(),
                        paidAt: new Date(),
                        stablecoin: lease.stablecoin || "USDC",
                    }
                });
            }

            // ADVANCE THE SCHEDULE: Create the NEXT monthly milestone
            const currentDueDate = currentUpcoming?.dueDate ? new Date(currentUpcoming.dueDate) : new Date();
            const nextDueDate = new Date(currentDueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            
            const nextDueSecs = Math.floor(nextDueDate.getTime() / 1000);

            // Check if next month's UPCOMING record already exists to avoid duplicates
            const existingNext = await prisma.payment.findFirst({
                where: {
                    leaseId,
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
                        leaseId,
                        buildingId: lease.buildingId,
                        amount: lease.monthlyRent,
                        status: "UPCOMING",
                        dueDate: nextDueDate,
                        stablecoin: lease.stablecoin || "USDC",
                    }
                });
            }

            // Update lease with next due date
            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    nextDueTimestamp: BigInt(nextDueSecs),
                }
            });
        } else {
            // FAILED Payment: Just log the attempt but keep the upcoming one as is
            await prisma.payment.create({
                data: {
                    leaseId,
                    buildingId: lease.buildingId,
                    amount,
                    status: "FAILED",
                    transactionHash: transactionHash || null,
                    dueDate: new Date(),
                    stablecoin: lease.stablecoin || "USDC",
                    failureReason: error || "Payment failed on-chain"
                }
            });
        }

        return NextResponse.json({ success: true, message: "Payment synced successfully" });

    } catch (error: any) {

        return NextResponse.json({ success: false, message: "Server error syncing payment" }, { status: 500 });
    }
}
