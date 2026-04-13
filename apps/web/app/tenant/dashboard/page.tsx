import TenantCard from "@/components/tenant/dashboard/tenantcard";
import TenantDashboardTopbar from "@/components/tenant/dashboard/topbar";
import TenantIntro from "@/components/tenant/dashboard/tenantintro";
import BriefInfo from "@/components/tenant/dashboard/briefinfo";
import PropertyHeader from "@/components/tenant/dashboard/propertyheader";
import { BalanceCard } from "@/components/tenant/dashboard/walletbalancecard";
import PaymentHistory from "@/components/tenant/dashboard/paymenthistory";

export default function TenantDashboardPage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <TenantDashboardTopbar />
            <TenantIntro />
            <BriefInfo />
            <div className="flex flex-col md:flex-row gap-4 w-full h-full  items-center  ">
                <div className="w-full md:w-2/3 h-full">
                    <PropertyHeader title="Unit 14B - Skyline Azure" address="782 Ocean Drive, Miami FL" image="/property-view.jpg" stats={[
                        { label: "BEDROOM", val: "2.5 Bath" },
                        { label: "SQ. FOOTAGE", val: "1,450 ft²" },
                        { label: "SECURITY", val: "Smart Lock" }
                    ]} />
                </div>
                <div className="w-full md:w-1/3 h-full flex items-center">
                    <BalanceCard />
                </div>
            </div>
            <div className="flex gap-2 w-full">

                <PaymentHistory />


            </div>
        </div>
    );
}