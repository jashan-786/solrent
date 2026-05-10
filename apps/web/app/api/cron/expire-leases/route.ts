import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await prisma.lease.updateMany({
      where: {
        status: { in: ["ACTIVE", "TERMINATION_REQUESTED"] },
        endDate: { lt: todayStart },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `Expired ${result.count} lease(s) whose endDate has passed.`,
    });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, message: "Failed to expire leases" },
      { status: 500 }
    );
  }
}
