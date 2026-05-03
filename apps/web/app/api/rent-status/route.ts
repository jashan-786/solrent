import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession(); // Helper that checks cookies

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use the session.walletAddress to find their specific rent info
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

    return NextResponse.json({ success: true, rentStatus: user.tenantLeases }, { status: 200 });

  } catch (error) {
    console.error("Error fetching rent status:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
