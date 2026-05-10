import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing lease id" }, { status: 400 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                id,
                ...(session.role === "TENANT" ? { tenantId: session.id } : {}),
                ...(session.role === "LANDLORD" ? { building: { landlordId: session.id } } : {}),
            },
            select: {
                leaseDocumentUrl: true,
            },
        });

        if (!lease || !lease.leaseDocumentUrl) {
            return NextResponse.json({ success: false, message: "Lease document not found" }, { status: 404 });
        }

        if (lease.leaseDocumentUrl.startsWith("http")) {
            return NextResponse.json({ success: true, signedUrl: lease.leaseDocumentUrl });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const bucketName = process.env.SUPABASE_LEASE_DOCS_BUCKET || "lease-documents";

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json({
                success: false,
                message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(lease.leaseDocumentUrl, 60);

        if (error || !data?.signedUrl) {
            return NextResponse.json({
                success: false,
                message: error?.message || "Failed to create signed URL",
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, signedUrl: data.signedUrl });
} catch (error) {

    return NextResponse.json({ success: false, message: "Server error generating signed URL" }, { status: 500 });
}
}

