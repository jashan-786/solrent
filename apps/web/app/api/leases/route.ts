import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaseStatus } from "@prisma/client";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getStablecoinMint } from "@repo/anchor";

export async function GET(req: NextRequest) {

    try {
        const session = await getSession();
        const landlordId = session?.role === "LANDLORD" ? session?.id : null;
        const tenantId = session?.role === "TENANT" ? session?.id : null;
        const buildingId = req.nextUrl.searchParams.get("buildingId");

        let filter: any = {};

        if (landlordId) filter.building = { landlordId: landlordId };
        if (buildingId) filter.unit = { buildingId: buildingId };
        if (tenantId) filter.tenantId = tenantId;

        const leases = await prisma.lease.findMany({
            where: filter,
            include: {
                unit: {
                    include: {
                        building: true,
                    }
                },
                tenant: true,
            }
        });

        const leasesSerialized = leases.map(lease => {
            const effectiveStatus = getEffectiveLeaseStatus(lease.status, lease.endDate);
            return {
                ...lease,
                status: effectiveStatus,
                onChainId: lease.onChainId?.toString() || null,
            };
        });

        return NextResponse.json({
            success: true,
            leases: leasesSerialized,
        });
    } catch (error) {

        return NextResponse.json({
            success: false,
            message: "Error fetching leases",
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (session?.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const landlordId = session.id;
        const landlord = await prisma.user.findUnique({ where: { id: landlordId } });

        if (!landlord || !landlord.walletAddress) {
            return NextResponse.json({
                success: false,
                message: "Landlord wallet not verified. Please connect and verify your wallet on the dashboard first."
            }, { status: 403 });
        }

        try {
            const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
            const connection = new Connection(rpcUrl);
            const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: rpcUrl });
            const ata = await getAssociatedTokenAddress(usdcMint, new PublicKey(landlord.walletAddress));
            const info = await connection.getAccountInfo(ata);

            if (!info) {
                return NextResponse.json({
                    success: false,
                    message: "Landlord USDC account not initialized. Please click 'Complete Setup' on your dashboard before creating a lease."
                }, { status: 403 });
            }
        } catch (e) {

            return NextResponse.json({ success: false, message: "Failed to verify wallet status. Please try again later." }, { status: 500 });
        }
        const body = await req.json();

        const {
            tenantEmail, unitId, buildingId, monthlyRent, depositAmount,
            stablecoin = "USDC", startDate, endDate,
            autoPayEnabled = false, leaseDocumentUrl, onChainId, onChainAddress
        } = body;

        if (!tenantEmail || !unitId || !buildingId || !monthlyRent || !startDate || !endDate) {
            return NextResponse.json({ success: false, message: "Missing required fields: tenantEmail, unitId, buildingId, monthlyRent, startDate, endDate" }, { status: 400 });
        }

        const tenant = await prisma.user.findUnique({ where: { email: tenantEmail } });
        if (!tenant) {
            return NextResponse.json({ success: false, message: "Tenant not found. Please invite them first." }, { status: 400 });
        }

        const lease = await prisma.lease.create({
            data: {
                tenantId: tenant.id,
                unitId,
                monthlyRent: Number(monthlyRent),
                depositAmount: depositAmount ? Number(depositAmount) : null,
                buildingId,
                stablecoin,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                autoPayEnabled,
                leaseDocumentUrl: leaseDocumentUrl || null,
                status: LeaseStatus.PENDING,
                onChainId: onChainId ? BigInt(onChainId) : null,
                onChainAddress: onChainAddress || null,
            }
        });

        const firstDueDate = new Date(startDate);
        firstDueDate.setDate(firstDueDate.getDate() + 1);
        await prisma.payment.create({
            data: {
                leaseId: lease.id,
                buildingId,
                amount: Number(monthlyRent),
                stablecoin,
                dueDate: firstDueDate,
                status: "UPCOMING",
            }
        });

        await prisma.unit.update({
            where: { id: unitId },
            data: { occupied: true },
        });

        return NextResponse.json({
            success: true,
            lease: {
                ...lease,
                onChainId: lease.onChainId?.toString() || null,
            },
        });
    } catch (error) {

        return NextResponse.json({
            success: false,
            message: "Error creating lease",
        }, { status: 500 });
    }
}