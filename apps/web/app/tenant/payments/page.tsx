import PaymentTab from "@/components/tenant/payments/paymenttab";
import { StatsOverview } from "@/components/tenant/payments/stats";
import Tabs from "@/components/tenant/payments/tabs";
import PaymentHeader from "@/components/tenant/payments/paymentheader";

export default function Payments() {
    return (
        <div className="bg-[#F7F9FB]">
            <div className="max-w-7xl mx-auto p-6 md:p-10 ]">
                <PaymentHeader />
                <StatsOverview />
                <Tabs />
                <PaymentTab />


            </div>
        </div>
    );
}