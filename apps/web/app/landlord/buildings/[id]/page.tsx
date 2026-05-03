"use client"

import { useParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import BuildingDetailsPage from "@/components/landlord/buildings/buildingdetails";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Page() {
    const { id } = useParams();
    const { data, isLoading, error } = useSWR(id ? `/api/landlord/building/${id}` : null, fetcher);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    if (error || !data?.success) return (
        <div className="p-8 text-center text-destructive">
            <h2 className="text-xl font-bold text-primary-900">Failed to load property</h2>
            <p className="text-text-500 mt-2">The requested property could not be found or you do not have permission to view it.</p>
        </div>
    );

    return (
        <div className="p-0">
            <BuildingDetailsPage building={data.building} />
        </div>
    )
}