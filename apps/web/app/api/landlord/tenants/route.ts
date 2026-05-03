import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Building } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";
import { email, z } from "zod"
import { Tenant } from "../../zod";




export async function GET(req: NextRequest) {

    const session = await getSession();
    const landlordId = session?.id;
    const buildingId = req.nextUrl.searchParams.get("buildingId");

    try {
        if (!landlordId || !buildingId)
            return NextResponse.json(
                {
                    success: false,
                    message: "missing landlord id or building id"
                },
                { status: 400 }
            )
        else {

            const tenants: Tenant[] = await prisma.user.findMany({
                where: {
                    role: "TENANT",
                    landlordId: landlordId,
                    tenantLeases: {
                        some: {
                            unit: {
                                buildingId: buildingId
                            }
                        }
                    }
                }
            })

            console.log("--------------------------------------------------------------")
            console.log("tenants", tenants)
            console.log("--------------------------------------------------------------")

            return NextResponse.json(
                {
                    success: true,
                    tenants
                },
                { status: 200 }
            )
        }


    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Error in fetching"
            },
            { status: 500 }
        )

    }
}