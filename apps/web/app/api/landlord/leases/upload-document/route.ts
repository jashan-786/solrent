import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== "LANDLORD") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ success: false, message: "File too large. Max size is 10MB." }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const objectPath = `landlord-${session.id}/${timestamp}-${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(objectPath, fileBuffer, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json({
                success: false,
                message: `Failed to upload document: ${uploadError.message}`,
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            leaseDocumentPath: objectPath,
        });
    } catch (error) {
        
        return NextResponse.json({ success: false, message: "Server error uploading document" }, { status: 500 });
    }
}
