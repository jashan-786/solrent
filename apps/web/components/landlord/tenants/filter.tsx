"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { Building } from "@prisma/client";
import useSWR from "swr";
import axios from "axios";
import { LeaseStatus, PaymentStatus } from "@repo/types";

interface FilterComponentProps {
    search: string;
    setSearch: (val: string) => void;
    buildingFilter: string;
    setBuildingFilter: (val: string) => void;
    leaseStatusFilter: string;
    setLeaseStatusFilter: (val: string) => void;
    paymentStatusFilter: string;
    setPaymentStatusFilter: (val: string) => void;
}

export default function FilterComponent({
    search,
    setSearch,
    buildingFilter,
    setBuildingFilter,
    leaseStatusFilter,
    setLeaseStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
}: FilterComponentProps) {

    const leaseStatusOptions: { id: number, status: LeaseStatus }[] = [
        { id: 1, status: "ACTIVE" },
        { id: 2, status: "EXPIRED" },
        { id: 3, status: "TERMINATED" },
        { id: 4, status: "PENDING" },
    ];

    const paymentStatusOptions: { id: number, label: string, status: string }[] = [
        { id: 1, label: "PENDING", status: "UPCOMING" },
        { id: 2, label: "PAID", status: "COMPLETED" },
        { id: 3, label: "FAILED", status: "FAILED" },
        { id: 4, label: "OVERDUE", status: "OVERDUE" },
    ];

    const fetcher = (url: string) => axios.get(url).then((res) => res.data);
    const { data } = useSWR("/api/landlord/buildings", fetcher);
    const buildings = data?.buildings || [];

    const handleClearFilters = () => {
        setSearch("");
        setBuildingFilter("ALL");
        setLeaseStatusFilter("ALL");
        setPaymentStatusFilter("ALL");
    };

    return (
        <div className="flex flex-wrap p-8  items-center gap-3 py-4">

            <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-grey" />
                <Input
                    placeholder="Search by name, email, unit, wallet or transaction..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-background-grey border-none h-12 rounded-xl text-base placeholder:text-text-grey"
                />
            </div>

            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger className="w-fit min-w-[160px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="All Buildings" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Buildings</SelectItem>
                    {buildings.map((building: Building) => (
                        <SelectItem key={building.id} value={building.id}>
                            {building.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={leaseStatusFilter} onValueChange={setLeaseStatusFilter}>
                <SelectTrigger className="w-fit min-w-[160px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="Lease Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Leases</SelectItem>
                    {leaseStatusOptions.map((lease) => (
                        <SelectItem key={lease.status} value={lease.status}>
                            {lease.status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-fit min-w-[180px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Payments</SelectItem>
                    {paymentStatusOptions.map((opt) => (
                        <SelectItem key={opt.status} value={opt.status}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="secondary"
                className="h-12 w-12 bg-background-grey rounded-xl p-0 hover:bg-slate-200"
                onClick={handleClearFilters}
                title="Clear all filters"
            >
                <SlidersHorizontal className="h-5 w-5 text-auth-navy" />
            </Button>
        </div>
    );
}