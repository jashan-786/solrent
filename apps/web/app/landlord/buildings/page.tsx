"use client";

import { useState } from "react";
import BuildingHeader from "@/components/landlord/buildings/buildingheader";
import Buildings from "@/components/landlord/buildings/buildings";

export type SortOption = "name" | "yield" | "occupancy";

export default function BuildingsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState<string | null>(null);
    const [occupancyFilter, setOccupancyFilter] = useState<"occupied" | "vacant" | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("name");

    return (
        <div className="flex flex-col gap-4 p-4">
            <BuildingHeader
                onSearch={setSearchQuery}
                onCityFilter={setCityFilter}
                onOccupancyFilter={setOccupancyFilter}
                onSort={setSortBy}
                currentFilters={{ city: cityFilter, occupancy: occupancyFilter, sortBy }}
            />
            <Buildings
                searchQuery={searchQuery}
                cityFilter={cityFilter}
                occupancyFilter={occupancyFilter}
                sortBy={sortBy}
            />
        </div>
    );
}