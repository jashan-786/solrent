
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



        const payment = await prisma.payment.create({
            data: {
                leaseId,
                buildingId: lease.buildingId,
                amount,
                status: status === "COMPLETED" ? "COMPLETED" : "FAILED",
                transactionHash: transactionHash || null,
                nftReceiptMint: nftMint || null,
                dueDate: new Date(),
                stablecoin: lease.stablecoin || "USDC",
            },
        });


        if (status === "COMPLETED") {
            const currentDue = lease.nextDueTimestamp ? Number(lease.nextDueTimestamp) : Math.floor(new Date(lease.startDate).getTime() / 1000);
            const nextDue = BigInt(currentDue + 2592000);

            

            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    nextDueTimestamp: nextDue,
                },
            });

        }

        return NextResponse.json({ success: true, message: "Payment synced successfully" });

    } catch (error: any) {

        return NextResponse.json({ success: false, message: "Server error syncing payment" }, { status: 500 });
    }
}
