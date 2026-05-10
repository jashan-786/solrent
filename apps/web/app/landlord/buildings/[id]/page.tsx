"use client"
import { Building } from "@repo/types";
import { useParams } from "next/navigation";
import { data } from "@/components/landlord/buildings/buildings";
import BuildingDetailsPage from "@/components/landlord/buildings/buildingdetails";

export default function Page() {
    const { id } = useParams();
    const buildingData: Building | undefined = data.find((building) => building.id === id);
    return (
        <div>
            <BuildingDetailsPage building={buildingData as Building} />
        </div>
    )
}