import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            include: {
                building: { select: { id: true, name: true, } },
                lease: {
                    include: {
                        tenant: { select: { id: true, name: true, email: true, } },
                    }
                },
            },
            where: { building: { landlord: { id: session.id } } },
            orderBy: { dueDate: "desc" },
        });

        const totalVolumeResult = await prisma.payment.aggregate({
            where: { building: { landlord: { id: session.id } } },
            _sum: { amount: true },
        });
        const pendingSettlements = await prisma.payment.count({
            where: { building: { landlord: { id: session.id } }, status: PaymentStatus.UPCOMING },
        });
        const failedTransfers = await prisma.payment.count({
            where: { building: { landlord: { id: session.id } }, status: PaymentStatus.FAILED },
        });
        const totalPaid = await prisma.payment.count({
            where: { building: { landlord: { id: session.id } }, status: PaymentStatus.COMPLETED },
        });

        const total = payments.length;
        const percentage = total === 0 ? 0 : (totalPaid / total) * 100;

        const serializedPayments = payments.map(payment => ({
            ...payment,
            lease: {
                ...payment.lease,
                onChainId: payment.lease.onChainId?.toString() || null,
                nextDueTimestamp: payment.lease.nextDueTimestamp?.toString() || null,
            }
        }));

        return NextResponse.json({
            success: true,
            payments: serializedPayments,
            totalVolume: totalVolumeResult._sum.amount || 0,
            pendingSettlements,
            failedTransfers,
            totalPaid,
            percentage,
            total
        }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching payments" }, { status: 500 });
    }
}