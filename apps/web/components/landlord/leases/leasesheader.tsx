import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import InviteTenantModal from "@/components/modals/invitetenant";
import AddLeaseModal from "@/components/modals/addlease";

export default function LeasesHeader() {
    return (
        <div className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Side: Title and Description */}
            <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Lease Management
                </h1>
                <p className="text-lg text-muted-foreground">
                    Manage digital lease agreements and NFT property deeds.
                </p>
            </div>

            {/* Right Side: Action Button */}
            <AddLeaseModal />
        </div>
    );
}