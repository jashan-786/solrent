import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MilestonesProps, ReceiptsProps } from "@repo/types";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        const tenantId = session?.id;

        if (!tenantId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            where: {
                lease: { tenantId }
            },
            include: {
                lease: {
                    include: {
                        unit: {
                            include: { building: true }
                        }
                    }
                }
            },
            orderBy: { dueDate: "desc" }
        });

        const leases = await prisma.lease.findMany({
            where: { tenantId, leaseNftMint: { not: null } },
            include: {
                unit: {
                    include: { building: true }
                }
            }
        });

        const paymentReceipts: ReceiptsProps[] = payments.map((p, idx) => {
            const isCompleted = p.status === "COMPLETED";
            const isPending = p.status === "UPCOMING" || p.status === "OVERDUE";
            const month = new Date(p.dueDate).toLocaleString("default", { month: "long", year: "numeric" });
            const building = p.lease?.unit?.building?.name || "Property";
            const unit = p.lease?.unit?.unitNumber || "";

            let type = "Rent Receipt";
            let rarity = "Common";

            if (p.nftReceiptMint) {
                type = "Minted NFT";
                rarity = "Legendary";
            } else if (isCompleted) {
                type = "Verified Receipt";
                rarity = "Rare";
            } else if (isPending) {
                type = "Pending Receipt";
                rarity = "Common";
            }

            return {
                id: p.id,
                title: `${month} Rent`,
                description: `${building} #${unit} — ${p.amount} ${p.stablecoin}`,
                type,
                rarity,
                status: p.status,
                amount: p.amount,
                stablecoin: p.stablecoin,
                dueDate: p.dueDate,
                paidAt: p.paidAt,
                transactionHash: p.transactionHash,
                nftReceiptMint: p.nftReceiptMint,
                building,
                unit
            };
        });

        const leaseReceipts: ReceiptsProps[] = leases.map(l => {
            const building = l.unit?.building?.name || "Property";
            const unit = l.unit?.unitNumber || "";
            return {
                id: l.id,
                title: `Lease Agreement`,
                description: `${building} #${unit} — Official Lease`,
                type: "Lease NFT",
                rarity: "Mythic",
                status: "COMPLETED",
                amount: l.monthlyRent,
                stablecoin: l.stablecoin,
                dueDate: l.startDate,
                paidAt: l.createdAt,
                transactionHash: l.onChainAddress,
                nftReceiptMint: l.leaseNftMint,
                building,
                unit
            };
        });

        const receipts = [...leaseReceipts, ...paymentReceipts];

        const milestones: MilestonesProps[] = payments.map(p => ({
            month: new Date(p.dueDate).toLocaleString("default", { month: "short", year: "2-digit" }).toUpperCase(),
            status: p.status === "COMPLETED" ? "completed" : p.status === "UPCOMING" ? "pending" : "pending"
        }));

        const completedCount = payments.filter(p => p.status === "COMPLETED").length;

        return NextResponse.json({
            success: true,
            receipts,
            milestones,
            streak: completedCount
        });

    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
