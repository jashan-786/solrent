import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Building, CTAEmptyStateProps } from "@repo/types/building"
import Image from "next/image";
import { Badge, MoreVertical, Plus, Store } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import CTAEmptyStateCompnent from "./addbuilding";





const BuildingCard = ({ building }: { building: Building }) => {
    const occupancyRate = Math.round((building.occupied / building.units) * 100);

    return (
        <Card className=" border-none shadow-sm bg-surface-primary max-w-2xl p-0 gap-0 rounded-xl h-full">
            <CardContent className="p-0 m-0 rounded-xl" >
                <div className=" h-full grid grid-cols-1 md:grid-cols-12 gap-2 rounded-xl ">

                    {/* Image Section - Takes 4 columns on desktop */}
                    <div className=" h-48 md:h-full md:col-span-4 lg:col-span-4 rounded-l-xl">
                        <Image
                            src={building.img} // Replace with building image URL
                            alt={building.name}
                            width={10000}
                            height={10000}
                            className="object-cover w-full h-full rounded-l-xl"
                        />

                    </div>

                    {/* Content Section - Takes 8 columns on desktop */}
                    <div className=" md:col-span-8 lg:col-span-8 md:h-full flex flex-col justify-between p-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className=" font-heading text-auth-navy font-bold">
                                    {building.name}
                                </h5>
                                <small className="flex items-center text-text-grey mt-1 p-2 ">
                                    <span className="mr-1">📍</span> {building.address}, {building.city}, {building.state}
                                </small>
                            </div>
                            <Button variant="ghost" size="icon" className="text-text-grey">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 ">
                            <div>
                                <p className="text-text-grey uppercase tracking-wider text-xs font-bold">Monthly Yield</p>
                                <p className="text-sm font-bold text-auth-navy mt-1">
                                    ${building.monthlyyield?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-text-grey uppercase tracking-wider text-xs font-bold">Total Units</p>
                                <small className=" font-bold text-auth-navy mt-1">
                                    {building.units} Units
                                </small>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2 ">
                            <Button
                                className="flex-1 text-sm bg-background-grey hover:bg-slate-200 text-auth-navy font-bold rounded-xl h-12"
                            >
                                View Details
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-12 h-12 text-sm rounded-xl border-background-grey text-auth-navy"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};













const data: Building[] = [
    {
        id: "bld-001",
        img: "/building-landing.png",
        name: "The Forks Residences",
        address: "123 Main St",
        city: "Winnipeg",
        state: "MB",
        zip: "R3C 1A3",
        country: "Canada",
        units: 45,
        occupied: 42,
        monthlyyield: 68500
    },
    {
        id: "bld-002",
        img: "/building-landing.png",
        name: "Exchange District Lofts",
        address: "88 Albert Street",
        city: "Winnipeg",
        state: "MB",
        zip: "R3B 1E7",
        country: "Canada",
        units: 12,
        occupied: 12,
        monthlyyield: 18000
    },
    {
        id: "bld-003",
        img: "/building-landing.png",
        name: "Pacific Sky Tower",
        address: "1150 West Georgia St",
        city: "Vancouver",
        state: "BC",
        zip: "V6E 4L2",
        country: "Canada",
        units: 120,
        occupied: 105,
        monthlyyield: 312000
    },
    {
        id: "bld-004",
        img: "/building-landing.png",
        name: "Liberty Village Flats",
        address: "50 East Liberty St",
        city: "Toronto",
        state: "ON",
        zip: "M6K 3P1",
        country: "Canada",
        units: 85,
        occupied: 80,
        monthlyyield: 195000
    },
    {
        id: "bld-005",
        img: "/building-landing.png",
        name: "Old Port Terraces",
        address: "410 Rue Saint-Nicolas",
        city: "Montreal",
        state: "QC",
        zip: "H2Y 2P5",
        country: "Canada",
        units: 30,
        occupied: 28,
        monthlyyield: 52400
    }
];



export default function buildings() {
    return (
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 mt-3  items-stretch ">
            {data.map((building) => (
                <BuildingCard key={building.id} building={building} />
            ))}

            <CTAEmptyStateCompnent />
        </div>
    )
}