import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import InviteTenantModal from "@/components/modals/invitetenant";

export default function TenantHeader() {
    return (
        <div className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Side: Title and Description */}
            <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Tenants
                </h1>
                <p className="text-lg text-muted-foreground">
                    Manage occupancy and lease agreements across your portfolio.
                </p>
            </div>


            <InviteTenantModal />
        </div>
    );
}