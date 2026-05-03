import TenantLayoutMain from "@/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute role="TENANT">
            <TenantLayoutMain>
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </TenantLayoutMain>
        </ProtectedRoute>
    );
}
