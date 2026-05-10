"use client";

import { useState } from "react";
import FilterComponent from "@/components/landlord/tenants/filter";
import TenantHeader from "@/components/landlord/tenants/tenantheader";
import TenantStats from "@/components/landlord/tenants/tenantstats";
import Main from "@/components/landlord/tenants/main";

export default function Tenants() {
    const [search, setSearch] = useState("");
    const [buildingFilter, setBuildingFilter] = useState("ALL");
    const [leaseStatusFilter, setLeaseStatusFilter] = useState("ALL");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

    return (
        <div>
            <TenantHeader />
            <TenantStats />
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
            <Main
                search={search}
                buildingFilter={buildingFilter}
                leaseStatusFilter={leaseStatusFilter}
                paymentStatusFilter={paymentStatusFilter}
            />
        </div>
    )
}
