import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeaseStatus, PaymentStatus } from "@prisma/client";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET() {
    try {
        const session = await getSession();
        const landlordId = session?.id;

        if (!landlordId || session?.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

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
        let pendingActions = 0; 

        for (const building of buildings) {
            for (const unit of building.units) {
                totalUnits++;
                if (unit.occupied) occupiedUnits++;
                
                for (const lease of unit.leases) {
                    const effectiveStatus = getEffectiveLeaseStatus(lease.status, lease.endDate);
                    if (effectiveStatus === LeaseStatus.ACTIVE) activeLeases++;
                    if (effectiveStatus === LeaseStatus.PENDING) pendingActions++;
                }
            }
        }

        const occupancyRate = totalUnits === 0 ? 0 : (occupiedUnits / totalUnits) * 100;

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

        const allUnits = buildings.flatMap(b => 
            b.units.map(u => ({
                id: u.id,
                unitNumber: u.unitNumber,
                buildingName: b.name,
                occupied: u.occupied,
            }))
        );

        const serializedRecentPayments = recentPayments.map(payment => ({
            ...payment,
            lease: payment.lease ? {
                ...payment.lease,
                onChainId: payment.lease.onChainId?.toString() || null,
            } : null
        }));

        const allCompletedPayments = await prisma.payment.findMany({
            where: {
                status: PaymentStatus.COMPLETED,
                building: { landlordId }
            },
            select: { amount: true, paidAt: true, stablecoin: true }
        });

        const monthlyRevenue = new Map<string, number>();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const currentMonth = new Date().getMonth();
        const revenueData: any[] = [];
        let maxRevenue = 0;

        for (let i = 11; i >= 0; i--) {
            let monthIndex = currentMonth - i;
            if (monthIndex < 0) monthIndex += 12;
            const m = months[monthIndex];
            if (m) monthlyRevenue.set(m, 0);
        }

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        allCompletedPayments.forEach(p => {
            if (p.paidAt && new Date(p.paidAt) >= twelveMonthsAgo) {
                const m = months[p.paidAt.getMonth()];
                if (m && monthlyRevenue.has(m)) {
                    monthlyRevenue.set(m, monthlyRevenue.get(m)! + p.amount);
                }
            }
        });

        monthlyRevenue.forEach((val, key) => {
            if (val > maxRevenue) maxRevenue = val;
        });

        monthlyRevenue.forEach((val, key) => {
            revenueData.push({
                m: key,
                h: maxRevenue === 0 ? "5%" : `${Math.max((val / maxRevenue) * 100, 5)}%`, 
                amount: val,
                active: val === maxRevenue && maxRevenue > 0
            });
        });

        const notifications = await prisma.notification.findMany({
            where: { userId: landlordId },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        const allTenants = await prisma.user.findMany({
            where: {
                role: "TENANT",
                landlordId: landlordId,
            },
            include: {
                tenantLeases: true
            }
        });

        const pendingTenants = allTenants.filter(t =>
            !t.tenantLeases.some(l => getEffectiveLeaseStatus(l.status, l.endDate) === "ACTIVE")
        );

        return NextResponse.json({
            success: true,
            stats: {
                totalRent: completedPayments._sum.amount || 0,
                occupancyRate: occupancyRate.toFixed(1),
                pendingActions: pendingActions + pendingTenants.length,
                activeLeases,
                totalUnits
            },
            recentPayments: serializedRecentPayments,
            units: allUnits,
            notifications,
            revenueData,
            pendingTenants: pendingTenants.map(t => ({
                id: t.id,
                name: t.name,
                email: t.email,
                building: "Unassigned",
                walletAddress: t.walletAddress
            }))
        }, { status: 200 });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
