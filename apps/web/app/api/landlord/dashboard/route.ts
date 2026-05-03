import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeaseStatus, PaymentStatus } from "@prisma/client";

export async function GET() {
    try {
        const session = await getSession();
        const landlordId = session?.id;

        if (!landlordId || session?.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Fetch all buildings owned by this landlord
        const buildings = await prisma.building.findMany({
            where: { landlordId },
            include: {
                units: {
                    include: {
                        leases: true
                    }
                }
            }
        });

        let totalUnits = 0;
        let occupiedUnits = 0;
        let activeLeases = 0;
        let pendingActions = 0; // Could be pending leases or failed payments

        for (const building of buildings) {
            for (const unit of building.units) {
                totalUnits++;
                if (unit.occupied) occupiedUnits++;
                
                for (const lease of unit.leases) {
                    if (lease.status === LeaseStatus.ACTIVE) activeLeases++;
                    if (lease.status === LeaseStatus.PENDING) pendingActions++;
                }
            }
        }

        const occupancyRate = totalUnits === 0 ? 0 : (occupiedUnits / totalUnits) * 100;

        // Fetch recent payments for this landlord's buildings
        const recentPayments = await prisma.payment.findMany({
            where: {
                lease: {
                    unit: {
                        building: {
                            landlordId: landlordId
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                lease: {
                    include: {
                        unit: {
                            include: { building: true }
                        },
                        tenant: true
                    }
                }
            }
        });

        // Calculate total rent from completed payments (for simple stat)
        const completedPayments = await prisma.payment.aggregate({
            where: {
                status: PaymentStatus.COMPLETED,
                lease: {
                    unit: {
                        building: { landlordId }
                    }
                }
            },
            _sum: {
                amount: true
            }
        });

        const failedPaymentsCount = await prisma.payment.count({
            where: {
                status: PaymentStatus.FAILED,
                lease: {
                    unit: { building: { landlordId } }
                }
            }
        });

        pendingActions += failedPaymentsCount;

        return NextResponse.json({
            success: true,
            stats: {
                totalRent: completedPayments._sum.amount || 0,
                occupancyRate: occupancyRate.toFixed(1),
                pendingActions,
                activeLeases,
                totalUnits
            },
            recentPayments
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
