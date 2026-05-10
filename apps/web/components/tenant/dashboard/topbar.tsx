"use client";

import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Search, Bell } from "lucide-react";
import { useState } from "react";
import { TenantNotificationsModal } from "@/components/tenant/dashboard/notificationsmodal";

export default function TenantDashboardTopbar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        const q = searchQuery.toLowerCase();
        if (q.includes("lease") || q.includes("contract")) {
            router.push("/tenant/leases");
        } else if (q.includes("payment") || q.includes("rent") || q.includes("pay")) {
            router.push("/tenant/payments");
        } else if (q.includes("nft") || q.includes("receipt") || q.includes("collectible")) {
            router.push("/tenant/nfts");
        } else if (q.includes("setting") || q.includes("profile") || q.includes("account")) {
            router.push("/tenant/settings");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div className="flex gap-3 w-full items-center">
            <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-400" />
                    <Input
                        placeholder="Search leases, payments, receipts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-10 h-10 rounded-xl bg-white border-background-200 text-sm"
                    />
                </div>
                <Button onClick={handleSearch} className="h-10 rounded-xl px-5 font-bold text-sm">Search</Button>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl h-10 w-10"
                    onClick={() => setIsNotificationsOpen(true)}
                >
                    <Bell className="h-4 w-4 text-text-500" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
                </Button>
            </div>

            <TenantNotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
}
