"use client"

import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { FileText, CreditCard } from "lucide-react";

export default function TenantIntro({ name }: { name?: string }) {
    const router = useRouter();

    return (
        <div className=" flex flex-row justify-between items-center w-full py-4 md:py-6">
            <div className="flex flex-col">
                <small className="text-text-500 font-medium uppercase tracking-widest text-[10px]">Tenant Overview</small>
                <h3 className="text-primary-900">Welcome Home, {name?.split(' ')[0] || "Resident"}</h3>
            </div>
            <div className="flex gap-2">
                <Button
                    variant={"outline"}
                    className="rounded-lg border-background-200 gap-2 font-bold"
                    onClick={() => router.push("/tenant/leases")}
                >
                    <FileText className="h-4 w-4" />
                    View Lease
                </Button>
                <Button
                    variant={"default"}
                    className="rounded-lg shadow-sm gap-2 font-bold"
                    onClick={() => router.push("/tenant/payments")}
                >
                    <CreditCard className="h-4 w-4" />
                    Payment Center
                </Button>
            </div>
        </div>
    );
}