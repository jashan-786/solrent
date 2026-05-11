"use client";

import useSWR from "swr";
import axios from "axios";
import { Card, CardContent } from "@repo/ui/components/ui/card"
import Image from "next/image";
import { MoreVertical, Plus, Search } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import CTAEmptyStateCompnent from "./addbuilding";
import ViewDetailsButton from "./viewdetails";
import { SortOption } from "@/app/landlord/buildings/page";
import { AddUnitModal } from "@/components/modals/addunitmodal";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const BuildingCard = ({ building }: { building: any }) => {
    return (
        <Card className="border-none shadow-md bg-white hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden group">
            <CardContent className="p-0">
                <div className="flex flex-col">
                    <div className="h-48 w-full relative overflow-hidden">
                        <Image
                            src={building.img || "/building-landing.png"}
                            alt={building.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-900">
                                    {building.units || 0} Units
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-black text-primary-900 text-2xl tracking-tight leading-tight">
                                    {building.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-text-400">
                                    <span className="text-sm">📍</span>
                                    <span className="text-xs font-bold uppercase tracking-wider leading-none">{building.city}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-text-300 hover:text-primary-900 rounded-xl">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-background-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-400">Monthly Yield</p>
                                <p className="text-xl font-black text-secondary-500">
                                    {building.monthlyyield?.toLocaleString() || "0"} <span className="text-xs ml-0.5 opacity-70">USDC</span>
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-400">Occupancy</p>
                                <p className="text-xl font-black text-primary-900">
                                    {Math.round(((building.occupied || 0) / (building.units || 1)) * 100)}%
                                    <span className="text-xs ml-1.5 text-text-400 font-bold uppercase">Full</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <div className="flex-1">
                                <ViewDetailsButton building={building} />
                            </div>
                            <AddUnitModal buildingId={building.id}>
                                <Button
                                    variant="outline"
                                    className="h-12 w-12 rounded-2xl border-background-200 text-primary-900 hover:bg-background-50 hover:border-primary-900/20 transition-all active:scale-95"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </AddUnitModal>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Buildings({ 
    searchQuery = "", 
    cityFilter = null, 
    occupancyFilter = null, 
    sortBy = "name" 
}: { 
    searchQuery?: string,
    cityFilter?: string | null,
    occupancyFilter?: "occupied" | "vacant" | null,
    sortBy?: SortOption
}) {
    const { data, isLoading } = useSWR("/api/landlord/buildings", fetcher);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 6;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, cityFilter, occupancyFilter, sortBy]);

    if (isLoading) return <BuildingsSkeleton />;

    const buildings = data?.buildings || [];

    let filteredBuildings = buildings.filter((building: any) => {
        const matchesSearch = 
            building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            building.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            building.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCity = !cityFilter || building.city === cityFilter;
        
        const occupancyRate = (building.units || 0) > 0 ? ((building.occupied || 0) / building.units) : 0;
        const matchesOccupancy = !occupancyFilter || 
            (occupancyFilter === "occupied" ? occupancyRate > 0.5 : occupancyRate <= 0.5);

        return matchesSearch && matchesCity && matchesOccupancy;
    });

    filteredBuildings = [...filteredBuildings].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "yield") return (b.monthlyyield || 0) - (a.monthlyyield || 0);
        if (sortBy === "occupancy") {
            const rateA = (a.units || 0) > 0 ? (a.occupied || 0) / a.units : 0;
            const rateB = (b.units || 0) > 0 ? (b.occupied || 0) / b.units : 0;
            return rateB - rateA;
        }
        return 0;
    });

    const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage);
    const paginatedBuildings = filteredBuildings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (filteredBuildings.length === 0 && searchQuery) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-background-200 mt-3">
                <Search className="h-12 w-12 text-text-300 mb-4" />
                <h3 className="text-xl font-bold text-primary-900">No properties found</h3>
                <p className="text-text-500">Try adjusting your search for "{searchQuery}"</p>
                <Button variant="link" onClick={() => window.location.reload()} className="mt-2 text-sol-indigo">
                    Clear all filters
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 ">
                {paginatedBuildings.map((building: any) => (
                    <BuildingCard key={building.id} building={building} />
                ))}
                {currentPage === totalPages || totalPages === 0 ? <CTAEmptyStateCompnent /> : null}
            </div>

            {}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 pb-20">
                    <p className="text-sm text-text-400 font-bold">
                        Showing <span className="text-primary-900 font-black">{paginatedBuildings.length}</span> of <span className="text-primary-900 font-black">{filteredBuildings.length}</span> properties
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 px-4 rounded-xl border-background-100 font-bold hover:bg-background-50 disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button 
                                    key={page}
                                    size="sm" 
                                    className={`h-10 w-10 rounded-xl font-black transition-all ${currentPage === page ? 'bg-primary-900 text-white shadow-md scale-110' : 'bg-background-50 text-primary-900 hover:bg-background-100'}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 px-4 rounded-xl border-background-100 font-bold hover:bg-background-50 disabled:opacity-50"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
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