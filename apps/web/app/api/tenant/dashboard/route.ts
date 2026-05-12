import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "Unauthorized: No tenant session found" }, { status: 401 });
        }

        const tenant = await prisma.user.findUnique({
            where: { id: tenantId },
            include: {
                tenantLeases: {
                    include: {
                        unit: {
                            include: { building: { include: { landlord: true } } }
                        },
                        payments: {
                            orderBy: { dueDate: 'asc' },
                        }
                    }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });
        }

        const activeLease = tenant.tenantLeases
            .map(l => ({ ...l, effectiveStatus: getEffectiveLeaseStatus(l.status, l.endDate) }))
            .sort((a, b) => {
                const priority: Record<string, number> = { "ACTIVE": 0, "TERMINATION_REQUESTED": 1, "PENDING": 2 };
                const aP = priority[a.effectiveStatus] ?? 99;
                const bP = priority[b.effectiveStatus] ?? 99;
                return aP - bP;
            })
            .find(l => 
                l.effectiveStatus === "ACTIVE" || 
                l.effectiveStatus === "PENDING" || 
                l.effectiveStatus === "TERMINATION_REQUESTED"
            ) || null;
        
        const allPayments = activeLease?.payments || [];

        const completedPayments = allPayments.filter(p => p.status === "COMPLETED");
        const pendingPayments = allPayments.filter(p => p.status === "UPCOMING" || p.status === "OVERDUE");

        if (activeLease && completedPayments.length > 0 && pendingPayments.length > 0) {
            const latestCompleted = [...completedPayments].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
            const earliestPending = [...pendingPayments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

            if (latestCompleted && earliestPending && new Date(earliestPending.dueDate) < new Date(latestCompleted.dueDate)) {
                
                
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
                        data: { 
                            status: "UPCOMING", 
                            paidAt: null, 
                            transactionHash: null,
                            nftReceiptMint: null
                        }
                    })
                ]);
                
                return GET(req); 
            }
        }

        const now = new Date();
        const deduplicated = allPayments.reduce((acc: any[], current) => {
            const date = new Date(current.dueDate);
            const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
            const existing = acc.find(p => {
                const pDate = new Date(p.dueDate);
                return `${pDate.getMonth()}-${pDate.getFullYear()}` === monthYear;
            });
            if (!existing) {
                acc.push(current);
            } else if (current.status === "COMPLETED" && existing.status !== "COMPLETED") {
                // If we have a duplicate and one is completed, keep the completed one
                const index = acc.indexOf(existing);
                acc[index] = current;
            }
            return acc;
        }, []);

        const processedPayments = deduplicated.map(p => {
            if (p.status === "UPCOMING" && new Date(p.dueDate) < now) {
                return { ...p, status: "OVERDUE" };
            }
            return p;
        });

        const nextPayment = processedPayments.find(p => p.status === "UPCOMING" || p.status === "OVERDUE");
        const pastPayments = processedPayments
            .filter(p => p.status === "COMPLETED" || p.status === "FAILED")
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

        return NextResponse.json({
            success: true,
            dashboard: {
                profile: {
                    id: tenant.id,
                    name: tenant.name,
                    email: tenant.email,
                    walletAddress: tenant.walletAddress,
                },
                activeLease: activeLease ? {
                    id: activeLease.id,
                    status: activeLease.status,
                    effectiveStatus: activeLease.effectiveStatus,
                    onChainId: activeLease.onChainId?.toString(),
                    monthlyRent: activeLease.monthlyRent,
                    stablecoin: activeLease.stablecoin,
                    startDate: activeLease.startDate,
                    endDate: activeLease.endDate,
                    unit: activeLease.unit,
                    autoPayEnabled: activeLease.autoPayEnabled,
                    landlordWallet: activeLease.unit.building.landlord.walletAddress
                } : null,
                expiredLeases: tenant.tenantLeases
                    .filter(l => getEffectiveLeaseStatus(l.status, l.endDate) === "EXPIRED")
                    .map(l => ({
                        id: l.id,
                        onChainId: l.onChainId?.toString(),
                        monthlyRent: l.monthlyRent,
                        stablecoin: l.stablecoin,
                        startDate: l.startDate,
                        endDate: l.endDate,
                        unit: l.unit,
                    })),
                nextPayment: nextPayment ? {
                    ...nextPayment,
                    onChainId: activeLease?.onChainId?.toString(),
                    onChainAddress: activeLease?.onChainAddress,
                    landlordWallet: activeLease?.unit.building.landlord.walletAddress
                } : null,
                pastPayments: pastPayments
            }
        }, { status: 200 });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Error fetching dashboard data" }, { status: 500 });
    }
}
