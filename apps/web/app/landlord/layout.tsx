import LandlordLayoutMain from "@/layouts/LandlordLayout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute role="LANDLORD">
            <LandlordLayoutMain>
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </LandlordLayoutMain>
        </ProtectedRoute>
    );
}
