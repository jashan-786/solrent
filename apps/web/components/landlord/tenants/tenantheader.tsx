import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

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

            {/* Right Side: Action Button */}
            <Button
                className="bg-auth-navy hover:bg-auth-slate text-white px-6 py-6 rounded-xl flex items-center gap-2 text-base font-semibold transition-all shadow-sm"
            >
                <UserPlus className="h-5 w-5" />
                Invite Tenant
            </Button>
        </div>
    );
}