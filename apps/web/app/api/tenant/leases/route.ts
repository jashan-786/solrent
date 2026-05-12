import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const rawLeases = await prisma.lease.findMany({
            where: { tenantId },
            include: {
                unit: {
                    include: {
                        building: {
                            include: {
                                landlord: {
                                    select: { walletAddress: true }
                                }
                            }
                        }
                    }
                },
                payments: {
                    orderBy: { dueDate: 'asc' }
                }
            }
        });

        for (const lease of rawLeases) {
            const completed = lease.payments.filter(p => p.status === "COMPLETED");
            const pending = lease.payments.filter(p => p.status === "UPCOMING" || p.status === "OVERDUE");

            if (completed.length > 0 && pending.length > 0) {
                const latestCompleted = [...completed].sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0];
                const earliestPending = [...pending].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

                if (latestCompleted && earliestPending && earliestPending.dueDate < latestCompleted.dueDate) {
                    
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: earliestPending.id },
                            data: { 
                                status: "COMPLETED", 
                                paidAt: latestCompleted.paidAt, 
                                transactionHash: latestCompleted.transactionHash,
                                nftReceiptMint: latestCompleted.nftReceiptMint
                            }
                        }),
                        prisma.payment.update({
                            where: { id: latestCompleted.id },
                            data: { status: "UPCOMING", paidAt: null, transactionHash: null, nftReceiptMint: null }
                        })
                    ]);
                    
                    return GET(req);
                }
            }
        }

        const leases = rawLeases;

        const serializedLeases = leases.map(lease => {
            const effectiveStatus = getEffectiveLeaseStatus(lease.status, lease.endDate);
            return {
                ...lease,
                status: effectiveStatus,
            };
        });

        return NextResponse.json({
            success: true,
            leases: serializedLeases
        }, { status: 200 });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
