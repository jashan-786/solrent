"use client";

import { useState } from "react";
import FilterComponent from "@/components/landlord/tenants/filter";
import LeasesStats from "@/components/landlord/leases/leasesstats";
import LeasesHeader from "@/components/landlord/leases/leasesheader";
import LeasesTable from "@/components/landlord/leases/leasestable";

export default function Leases() {
    const [search, setSearch] = useState("");
    const [buildingFilter, setBuildingFilter] = useState("ALL");
    const [leaseStatusFilter, setLeaseStatusFilter] = useState("ALL");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

    return (
        <div>
            <LeasesHeader />
            <LeasesStats />
            <FilterComponent
                search={search}
                setSearch={setSearch}
                buildingFilter={buildingFilter}
                setBuildingFilter={setBuildingFilter}
                leaseStatusFilter={leaseStatusFilter}
                setLeaseStatusFilter={setLeaseStatusFilter}
                paymentStatusFilter={paymentStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
            />
            <LeasesTable
                search={search}
                buildingFilter={buildingFilter}
                leaseStatusFilter={leaseStatusFilter}
            />
        </div>
    )
}
