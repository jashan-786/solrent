import FilterComponent from "@/components/landlord/tenants/filter";
import TenantHeader from "@/components/landlord/tenants/tenantheader";
import TenantStats from "@/components/landlord/tenants/tenantstats";
import Main from "@/components/landlord/tenants/main";

export default function Tenants() {
    return (
        <div>
            <TenantHeader />
            <TenantStats />
            <FilterComponent />
            <Main />
        </div>
    )
}
