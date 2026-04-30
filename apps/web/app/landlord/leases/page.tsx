import FilterComponent from "@/components/landlord/tenants/filter";
import TenantHeader from "@/components/landlord/tenants/tenantheader";
import Main from "@/components/landlord/leases/leasestable";
import LeasesStats from "@/components/landlord/leases/leasesstats";
import LeasesHeader from "@/components/landlord/leases/leasesheader";
import LeasesTable from "@/components/landlord/leases/leasestable";

export default function Leases() {
    return (
        <div>
            <LeasesHeader />
            <LeasesStats />
            <FilterComponent />
            <LeasesTable />
        </div>
    )
}
