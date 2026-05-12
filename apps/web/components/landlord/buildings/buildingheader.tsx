import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Loader2, PersonStanding, SortAsc, TowerControl, Search } from "lucide-react"
import useSWR from "swr"
import axios from "axios"
import { AddPropertyModal } from "@/components/modals/addpropertymodal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { SortOption } from "@/app/landlord/buildings/page"

export default function BuildingHeader({
    onSearch,
    onCityFilter,
    onOccupancyFilter,
    onSort,
    currentFilters
}: {
    onSearch?: (query: string) => void,
    onCityFilter?: (city: string | null) => void,
    onOccupancyFilter?: (status: "occupied" | "vacant" | null) => void,
    onSort?: (sort: SortOption) => void,
    currentFilters: { city: string | null, occupancy: string | null, sortBy: SortOption }
}) {
    const fetcher = (url: string) => axios.get(url).then((res: any) => res.data);
    const { data, isLoading } = useSWR("/api/landlord/buildings", fetcher);

    const cities = data?.buildings
        ? Array.from(new Set(data.buildings.map((b: any) => b.city)))
        : [];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[10vh] bg-white rounded-3xl p-8 border border-background-100">
            <Loader2 className="h-6 w-6 animate-spin text-secondary-500" />
        </div>
    );

    return (
        <div className="w-full flex flex-col">
            <div className="w-full flex justify-between items-center">
                <p className="text-text-grey font-bold uppercase tracking-widest text-[10px]">Portfolio Overview</p>
                <AddPropertyModal />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <StatsCard
                    heading="Total Buildings"
                    value={data?.totalBuildings?.toString() || "0"}
                />
                <StatsCard
                    heading="Portfolio Occupancy"
                    value={data?.occupancyRate ? `${data.occupancyRate}%` : "0%"}
                />
                <div className="sm:col-span-2">
                    <StatsCard
                        heading="Estimated Monthly Revenue"
                        value={data?.monthlyRevenue ? `${data.monthlyRevenue.toLocaleString()} USDC` : "0 USDC"}
                    />
                </div>
            </div>

            <div className="col-span-12 md:col-span-4 flex flex-col gap-3 justify-end">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-400" />
                    <Input
                        placeholder="Search properties..."
                        className="pl-10 bg-white border-none shadow-sm h-11 rounded-xl focus-visible:ring-sol-indigo"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 rounded-xl shadow-sm bg-background-grey">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-white text-black h-10 text-[10px] font-bold uppercase gap-2 hover:bg-white shadow-none border-none">
                                <PersonStanding size={14} /> {currentFilters.occupancy || "Status"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40 rounded-xl bg-white border-none shadow-xl p-1">
                            <DropdownMenuItem onClick={() => onOccupancyFilter?.(null)} className="text-xs font-bold rounded-lg cursor-pointer">All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOccupancyFilter?.("occupied")} className="text-xs font-bold rounded-lg cursor-pointer">Occupied</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOccupancyFilter?.("vacant")} className="text-xs font-bold rounded-lg cursor-pointer">Vacant</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-white text-black h-10 text-[10px] font-bold uppercase gap-2 hover:bg-white shadow-none border-none">
                                <TowerControl size={14} /> {currentFilters.city || "City"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40 rounded-xl bg-white border-none shadow-xl p-1">
                            <DropdownMenuItem onClick={() => onCityFilter?.(null)} className="text-xs font-bold rounded-lg cursor-pointer">All Cities</DropdownMenuItem>
                            {cities.map((city: any) => (
                                <DropdownMenuItem key={city} onClick={() => onCityFilter?.(city)} className="text-xs font-bold rounded-lg cursor-pointer">
                                    {city}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-white text-black h-10 text-[10px] font-bold uppercase gap-2 hover:bg-white shadow-none border-none">
                                <SortAsc size={14} /> {currentFilters.sortBy}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40 rounded-xl bg-white border-none shadow-xl p-1">
                            <DropdownMenuItem onClick={() => onSort?.("name")} className="text-xs font-bold rounded-lg cursor-pointer">Name</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSort?.("yield")} className="text-xs font-bold rounded-lg cursor-pointer">Yield</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSort?.("occupancy")} className="text-xs font-bold rounded-lg cursor-pointer">Occupancy</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>

    )
}

function StatsCard({ heading, value }: { heading: string, value: string }) {
    return (
        <Card className="bg-white border-none shadow-sm rounded-3xl p-6">
            <div className="space-y-1">
                <p className="text-text-400 uppercase tracking-widest text-[10px] font-black">{heading}</p>
                <h3 className="text-3xl font-black text-primary-900 tracking-tight">{value}</h3>
            </div>
        </Card>
    )
}
