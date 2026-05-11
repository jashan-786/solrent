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
            return NextResponse.json({
                success: false,
                message: "Lease document path is missing in database.",
                debug: { leaseId: id, foundLease: !!lease }
            }, { status: 404 });
        }

        if (lease.leaseDocumentUrl.startsWith("http")) {
            return NextResponse.redirect(lease.leaseDocumentUrl);
        }

        const supabaseUrl = process.env.SUPABASE_URL?.trim();
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
        const bucketName = (process.env.SUPABASE_LEASE_DOCS_BUCKET || "lease-documents").trim();

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json({ success: false, message: "Supabase config missing" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { persistSession: false }
        });

        const cleanPath = lease.leaseDocumentUrl.startsWith("/") 
            ? lease.leaseDocumentUrl.slice(1) 
            : lease.leaseDocumentUrl;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(cleanPath, 3600); // 1 hour expiry

        if (error || !data?.signedUrl) {
            return NextResponse.json({ 
                success: false, 
                message: error?.message || "Failed to generate signed URL",
                path: cleanPath
            }, { status: 500 });
        }

        // Automatically redirect the browser to the signed Supabase URL
        return NextResponse.redirect(data.signedUrl);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error", error: error?.message }, { status: 500 });
    }
}

