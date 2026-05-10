import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveLeaseStatus } from "@/lib/lease-status";

export async function GET() {
  const session = await getSession(); 

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.walletAddress },
      include: {
        tenantLeases: {
          include: {
            unit: {
              include: {
                building: true
              }
            }
          }
        }
      }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const serializedLeases = user.tenantLeases.map(lease => {
        const effectiveStatus = getEffectiveLeaseStatus(lease.status, lease.endDate);
        return {
            ...lease,
            status: effectiveStatus,
            onChainId: lease.onChainId?.toString() || null,
        };
    });

    return NextResponse.json({ success: true, rentStatus: serializedLeases }, { status: 200 });

  } catch (error) {
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
