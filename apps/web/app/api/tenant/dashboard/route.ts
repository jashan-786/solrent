import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "tenantId query parameter is required" }, { status: 400 });
        }

        // Fetch tenant profile and their active lease
        const tenant = await prisma.user.findUnique({
            where: { id: tenantId },
            include: {
                tenantLeases: {
                    where: { status: "ACTIVE" }, // Assuming a tenant only has one active lease
                    include: {
                        unit: {
                            include: { building: true }
                        },
                        payments: {
                            orderBy: { dueDate: 'desc' },
                            take: 10 // Get last 10 payments
                        }
                    }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ success: false, message: "Tenant not found" }, { status: 404 });
        }

        const activeLease = tenant.tenantLeases.length > 0 ? tenant.tenantLeases[0] : null;
        const allPayments = activeLease?.payments || [];
        const nextPayment = allPayments.find(p => p.status === "UPCOMING" || p.status === "OVERDUE");
        const pastPayments = allPayments.filter(p => p.status === "COMPLETED" || p.status === "FAILED");

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
                    monthlyRent: activeLease.monthlyRent,
                    stablecoin: activeLease.stablecoin,
                    startDate: activeLease.startDate,
                    endDate: activeLease.endDate,
                    unit: activeLease.unit,
                    autoPayEnabled: activeLease.autoPayEnabled,
                } : null,
                nextPayment: nextPayment,
                pastPayments: pastPayments
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching tenant dashboard data:", error);
        return NextResponse.json({ success: false, message: "Error fetching dashboard data" }, { status: 500 });
    }
}
