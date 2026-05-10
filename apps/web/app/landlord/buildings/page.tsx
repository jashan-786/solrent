import BuildingHeader from "@/components/landlord/buildings/buildingheader";
import Buildings from "@/components/landlord/buildings/buildings";

export default function BuildingsPage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <BuildingHeader />
            <Buildings />
        </div>
    )
}