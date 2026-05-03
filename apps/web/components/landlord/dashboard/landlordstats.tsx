"use client";

import useSWR from "swr";
import axios from "axios";
import { Banknote, DoorOpen, ClipboardList, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const LandlordStats = () => {
    const { data, error, isLoading } = useSWR("/api/landlord/dashboard", fetcher);

    if (isLoading) return <StatsSkeleton />;

    const stats = [
        { 
            title: "Total Revenue", 
            value: data?.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : "$0", 
            icon: Banknote, 
            color: "text-secondary-500" 
        },
        { 
            title: "Occupancy Rate", 
            value: data?.occupancyRate ? `${data.occupancyRate.toFixed(1)}%` : "0%", 
            icon: DoorOpen, 
            color: "text-text-950" 
        },
        { 
            title: "Total Units", 
            value: data?.totalUnits || "0", 
            icon: ClipboardList, 
            color: "text-primary-600" 
        },
        { 
            title: "Active Leases", 
            value: data?.activeLeasesCount || "0", 
            icon: FileText, 
            color: "text-text-950" 
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="bg-card border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-tiny font-bold uppercase tracking-widest text-text-500">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <h4 className="text-text-950">{stat.value}</h4>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-none shadow-sm h-32 animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="h-3 w-20 bg-background-200 rounded" />
                    <div className="h-4 w-4 bg-background-200 rounded-full" />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-28 bg-background-200 rounded mt-2" />
                </CardContent>
            </Card>
        ))}
    </div>
);