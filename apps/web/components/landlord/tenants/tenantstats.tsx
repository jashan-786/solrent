"use client";
import axios from "axios";
import { Users, BarChart3, CalendarX, Wallet, Loader2 } from "lucide-react";
import useSWR from "swr";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const StatCard = ({ label, value, icon, iconBg, iconColor }: StatCardProps) => (
    <div className="flex items-center justify-between p-6 bg-background-100 rounded-2xl  shadow-sm hover:shadow-md transition-all w-full">
        <div className="space-y-1">
            <p className="text-xs font-bold text-text-700 uppercase tracking-wider">
                {label}
            </p>
            <h3 className="text-3xl font-bold text-text-950">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
            {icon}
        </div>
    </div>
);

export default function TenantStats() {
    const fetcher = (url: string) => axios.get(url).then((res: any) => res.data);
    const { data, error, isLoading }: { data: { success: boolean; totalTenants: number; totalActiveLeases: number; expiredLeases: number; totalRent: number, occupancyRate: number, walletsLinked: number } | null, error: any, isLoading: boolean } = useSWR("/api/landlord/tenants", fetcher);

    const stats: StatCardProps[] = [
        {
            label: "Total Tenants",
            value: data?.totalTenants || 0,
            icon: <Users size={24} />,
            iconBg: "bg-background-200",
            iconColor: "text-text-950",
        },
        {
            label: "Occupancy Rate",
            value: `${data?.occupancyRate != null ? Number(data.occupancyRate).toFixed(0) : 0}%`,
            icon: <BarChart3 size={24} />,
            iconBg: "bg-primary-100",
            iconColor: "text-primary-700",
        },
        {
            label: "Expired Leases",
            value: data?.expiredLeases || 0,
            icon: <CalendarX size={24} />,
            iconBg: "bg-secondary-100",
            iconColor: "text-secondary-600",
        },

        {
            label: "Wallet Synced",
            value: `${data?.walletsLinked ?? 0}`,
            icon: <Wallet size={24} />,
            iconBg: "bg-primary-100",
            iconColor: "text-primary-600",
        },
    ];

    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
            </div>
        );
    }

    if (error) return (
        <div className="flex items-center justify-center">
            <p className="text-destructive">Failed to load tenant data</p>
        </div>
    );

    return <div className="grid p-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
        ))}
    </div>;
}