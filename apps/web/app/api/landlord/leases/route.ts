import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";
import { z } from "zod";

const createLeasePayload = z.object({
    tenantWallet: z.string().min(32, "Invalid wallet address"),
    tenantEmail: z.string().email("Invalid email"),
    unitId: z.string().cuid("Unit ID is required"),
    buildingId: z.string().cuid("Building ID is required"),
    monthlyRent: z.number().positive("Monthly rent must be positive"),
    securityDeposit: z.number().nonnegative().optional().default(0),
    stablecoin: z.enum(["USDC", "PYUSD"]).default("USDC"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    autoPayEnabled: z.boolean().default(false),
    onChainId: z.string().optional(),
    onChainAddress: z.string().optional(),
    transactionHash: z.string().optional(),
    leaseNftMint: z.string().optional(),
    leaseDocumentUrl: z.string().min(1, "A lease document path is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = createLeasePayload.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid lease data",
                errors: validation.error.format(),
            }, { status: 400 });
        }

        const data = validation.data;

        const building = await prisma.building.findFirst({
            where: { id: data.buildingId, landlordId: session.id },
        });

        if (!building) {
            return NextResponse.json({ success: false, message: "Building not found or not owned by you" }, { status: 404 });
        }

        const unit = await prisma.unit.findFirst({
            where: { id: data.unitId, buildingId: data.buildingId },
        });

        if (!unit) {
            return NextResponse.json({ success: false, message: "Unit not found in this building" }, { status: 404 });
        }

        let tenant = await prisma.user.findFirst({
            where: { walletAddress: data.tenantWallet },
        });

        if (!tenant) {
            tenant = await prisma.user.findFirst({
                where: { email: data.tenantEmail },
            });
        }

        if (!tenant) {
            return NextResponse.json({
                success: false,
                message: "Tenant not found. The tenant must register (via invite code) before a lease can be created.",
            }, { status: 404 });
        }

        const existingLease = await prisma.lease.findFirst({
            where: {
                tenantId: tenant.id,
                unitId: data.unitId,
                status: "ACTIVE",
            },
        });

        if (existingLease) {
            return NextResponse.json({
                success: false,
                message: "An active lease already exists for this tenant on this unit.",
            }, { status: 409 });
        }

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        // Safe conversion for BigInt fields
        const onChainIdBigInt = data.onChainId ? BigInt(data.onChainId) : null;
        
        let nextDueTimestamp: bigint | null = null;
        if (data.startDate) {
            const ts = Math.floor(new Date(data.startDate).getTime() / 1000);
            if (!isNaN(ts)) {
                nextDueTimestamp = BigInt(ts);
            }
        }

        const lease = await prisma.lease.create({
            data: {
                tenantId: tenant.id,
                unitId: data.unitId,
                buildingId: data.buildingId,
                monthlyRent: data.monthlyRent,
                depositAmount: data.securityDeposit,
                stablecoin: data.stablecoin,
                startDate,
                endDate,
                status: "PENDING",
                autoPayEnabled: data.autoPayEnabled,
                onChainId: onChainIdBigInt,
                onChainAddress: data.onChainAddress || null,
                leaseNftMint: data.leaseNftMint || null,
                leaseDocumentUrl: data.leaseDocumentUrl || null,
                transactionHash: data.transactionHash || null,
                nextDueTimestamp,
            },
        });

        await prisma.unit.update({
            where: { id: data.unitId },
            data: { occupied: true },
        });

        const firstDueDate = new Date(startDate);
        firstDueDate.setMonth(firstDueDate.getMonth() + 1);

        await prisma.payment.create({
            data: {
                leaseId: lease.id,
                buildingId: data.buildingId,
                amount: data.monthlyRent,
                stablecoin: data.stablecoin,
                dueDate: firstDueDate,
                status: "UPCOMING",
            },
        });

        await prisma.notification.create({
            data: {
                userId: tenant.id,
                title: "New Lease Created",
                message: `A new lease has been created for unit ${unit.unitNumber} at ${building.name}. Monthly rent: ${data.monthlyRent} ${data.stablecoin}.`,
                type: "LEASE_CREATED",
            },
        });

        const serializedLease = {
            ...lease,
            onChainId: lease.onChainId?.toString() || null,
            nextDueTimestamp: lease.nextDueTimestamp?.toString() || null,
        };

        return NextResponse.json({
            success: true,
            lease: serializedLease,
            message: "Lease created successfully",
        }, { status: 201 });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error creating lease" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const leases = await prisma.lease.findMany({
            where: {
                unit: {
                    building: {
                        landlordId: session.id
                    }
                }
            },
            include: {
                tenant: true,
                unit: {
                    include: { building: true }
                }
            }
        });

        const mappedLeases = leases.map(l => {
            const effectiveStatus = getEffectiveLeaseStatus(l.status, l.endDate);
            return {
                id: l.id,
                tenantName: l.tenant.name,
                email: l.tenant.email,
                unit: l.unit.unitNumber,
                building: l.unit.building.name,
                buildingId: l.unit.building.id,
                monthlyRent: l.monthlyRent,
                currency: l.stablecoin,
                startDate: new Date(l.startDate).toLocaleDateString(),
                endDate: new Date(l.endDate).toLocaleDateString(),
                status: effectiveStatus,
                walletAddress: l.tenant.walletAddress || "N/A",
                onChainAddress: l.onChainAddress || null,
                isOnChain: !!l.onChainId || !!l.onChainAddress,
                leaseDocumentUrl: l.leaseDocumentUrl,
                transactionHash: l.transactionHash,
            };
        });

        return NextResponse.json({
            success: true,
            leases: mappedLeases,
            totalLeases: mappedLeases.length,
            occupancyRate: mappedLeases.length === 0 ? 0 : (mappedLeases.filter(l => l.status === "ACTIVE").length / mappedLeases.length) * 100,
            totalActiveLeases: mappedLeases.filter(l => l.status === "ACTIVE").length,
            totalInactiveLeases: mappedLeases.filter(l => l.status === "EXPIRED").length,
            totalRent: mappedLeases.reduce((acc, l) => acc + l.monthlyRent, 0),
        });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const leaseId = searchParams.get("id");

        if (!leaseId) {
            return NextResponse.json({ success: false, message: "Lease ID required" }, { status: 400 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                unit: {
                    building: { landlordId: session.id }
                }
            }
        });

        if (!lease) {
            return NextResponse.json({ success: false, message: "Lease not found" }, { status: 404 });
        }

        if (lease.status !== "TERMINATED") {
            return NextResponse.json({
                success: false,
                message: "Lease cannot be deleted until the tenant approves termination.",
            }, { status: 409 });
        }

        await prisma.$transaction([
            prisma.payment.deleteMany({ where: { leaseId } }),
            prisma.lease.delete({ where: { id: leaseId } }),
            prisma.unit.update({
                where: { id: lease.unitId },
                data: { occupied: false }
            })
        ]);

        return NextResponse.json({ success: true, message: "Lease deleted successfully" });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
