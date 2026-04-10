import type { ReactNode } from "react";
import TenantSidebar from "@repo/ui/components/tenantsidebar";

export default function TenantLayoutMain({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="flex flex-row">
                <TenantSidebar />
                <div className="flex-1 p-2">
                    {children}
                </div>
            </div>
        </>
    );
}