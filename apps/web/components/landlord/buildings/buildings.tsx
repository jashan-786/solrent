"use client";

import useSWR from "swr";
import axios from "axios";
import { Card, CardContent } from "@repo/ui/components/ui/card"
import Image from "next/image";
import { MoreVertical, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import CTAEmptyStateCompnent from "./addbuilding";
import ViewDetailsButton from "./viewdetails";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const BuildingCard = ({ building }: { building: any }) => {
    return (
        <Card className=" border-none shadow-sm bg-surface-primary max-w-2xl p-0 gap-0 rounded-xl">
            <CardContent className="p-0 m-0 rounded-xl h-full" >
                <div className=" h-full grid grid-cols-1 md:grid-cols-12 gap-2 rounded-xl ">
                    {/* Image Section */}
                    <div className=" h-48 md:h-full md:col-span-4 lg:col-span-4 rounded-l-xl bg-background-200">
                        <Image
                            src={building.img || "/building-landing.png"}
                            alt={building.name}
                            width={500}
                            height={500}
                            className="object-cover w-full h-full rounded-l-xl"
                        />
                    </div>

                    {/* Content Section */}
                    <div className=" md:col-span-8 lg:col-span-8 md:h-full flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className=" font-heading text-primary-900 font-bold text-lg">
                                    {building.name}
                                </h5>
                                <small className="flex items-center text-text-500 mt-1">
                                    <span className="mr-1">📍</span> {building.address}, {building.city}
                                </small>
                            </div>
                            <Button variant="ghost" size="icon" className="text-text-400">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-text-500 uppercase tracking-wider text-[10px] font-bold">Monthly Yield</p>
                                <p className="text-sm font-bold text-secondary-500 mt-1">
                                    ${building.monthlyyield?.toLocaleString() || "0"}
                                </p>
                            </div>
                            <div>
                                <p className="text-text-500 uppercase tracking-wider text-[10px] font-bold">Occupancy</p>
                                <small className=" font-bold text-primary-900 mt-1">
                                    {building.occupied} / {building.units} Units
                                </small>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <ViewDetailsButton building={building} />
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-10 h-10 rounded-lg border-background-200 text-primary-900"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Buildings() {
    const { data, isLoading } = useSWR("/api/landlord/buildings", fetcher);

    if (isLoading) return <BuildingsSkeleton />;

    const buildings = data?.buildings || [];

    return (
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 ">
            {buildings.map((building: any) => (
                <BuildingCard key={building.id} building={building} />
            ))}
            <CTAEmptyStateCompnent />
        </div>
    )
}

const BuildingsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-background-200 rounded-xl animate-pulse" />
        ))}
    </div>
);