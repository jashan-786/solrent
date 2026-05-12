import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const tenants = await prisma.user.findMany({
            where: {
                role: "TENANT",
                usedInviteCode: {
                    building: {
                        landlordId: session.id
                    }
                }
            },
            include: {
                tenantLeases: {
                    include: {
                        unit: {
                            include: { building: true }
                        },
                        payments: {
                            orderBy: { dueDate: 'desc' },
                            take: 1
                        }
                    }
                },
                usedInviteCode: {
                    include: {
                        building: true,
                        unit: true
                    }
                }
            }
        });

        const mappedTenants = tenants.map(t => {
            const activeLease = t.tenantLeases.find(l => getEffectiveLeaseStatus(l.status, l.endDate) === "ACTIVE");
            const lastPayment = activeLease?.payments[0];

            return {
                id: t.id,
                name: t.name,
                email: t.email,
                img: t.avatarUrl,
                building: activeLease?.unit?.building?.name || t.usedInviteCode?.building?.name || "N/A",
                buildingId: activeLease?.unit?.building?.id || t.usedInviteCode?.building?.id || null,
                unit: activeLease?.unit?.unitNumber || t.usedInviteCode?.unit?.unitNumber || "N/A",
                leaseStatus: activeLease?.status || "PENDING",
                paymentStatus: lastPayment?.status || "UPCOMING",
                nextDue: lastPayment?.dueDate ? new Date(lastPayment.dueDate).toLocaleDateString() : "N/A",
                walletAddress: t.walletAddress,
                inviteCode: t.usedInviteCode?.code || "N/A"
            };
        });

        const totalTenants = mappedTenants.length;
        const activeLeaseCount = tenants.filter(t => t.tenantLeases.some(l => getEffectiveLeaseStatus(l.status, l.endDate) === "ACTIVE")).length;
        const occupancyRate = totalTenants === 0 ? 0 : (activeLeaseCount / totalTenants) * 100;

        return NextResponse.json({
            success: true,
            totalTenants,
            occupancyRate: occupancyRate.toFixed(1),
            expiredLeases: tenants.filter(t => t.tenantLeases.some(l => getEffectiveLeaseStatus(l.status, l.endDate) === "EXPIRED")).length,
            walletsLinked: tenants.filter(t => !!t.walletAddress).length,
            tenants: mappedTenants
        });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}