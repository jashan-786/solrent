import { Building } from "@repo/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { ArrowLeft, MapPin, Users, Wallet, TrendingUp, History } from "lucide-react";
import { useRouter } from "next/navigation";



export default function BuildingDetailsPage({ building }: { building: Building }) {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-surface-primary p-6 lg:p-10">
            {/* 1. Navigation Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    onClick={() => router.back()}
                    variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-auth-navy flex items-center gap-3">
                        {building.name}
                        <Badge className="bg-sol-emerald/10 text-sol-emerald border-none">Active Asset</Badge>
                    </h2>
                    <p className="text-text-grey text-sm flex items-center gap-1">
                        <MapPin size={14} /> {building.address}, {building.city}, {building.country}
                    </p>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Deep Dive Info (8 Columns) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Hero Asset Card */}
                    <Card className="overflow-hidden border-none shadow-sm">
                        <div className="relative h-64 md:h-96 w-full">
                            <img
                                src={building.img || "/placeholder-building.jpg"}
                                alt={building.name}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg">
                                <p className="text-tiny font-bold text-text-grey uppercase">On-Chain ID</p>
                                <p className="font-mono text-xs text-sol-indigo">{building.id}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Analytics Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-transparent rounded-none w-full justify-start gap-8 h-12 p-0">
                            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-full bg-transparent px-0 font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="tenants" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-full bg-transparent px-0 font-bold">Tenants</TabsTrigger>
                            <TabsTrigger value="txs" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-full bg-transparent px-0 font-bold">On-Chain History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-6 border-none bg-white">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} /> Revenue Performance
                                    </h6>
                                    {/* Placeholder for a small Recharts area chart */}
                                    <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-text-grey text-xs">
                                        [Chart: Monthly Yield Trends]
                                    </div>
                                </Card>
                                <Card className="p-6 border-none bg-white">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <History size={16} /> Asset Details
                                    </h6>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Total Units</span>
                                            <span className="font-bold text-auth-navy">{building.units}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Current Occupancy</span>
                                            <span className="font-bold text-sol-emerald">{building.occupied} / {building.units}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Country</span>
                                            <span className="font-bold text-auth-navy">{building.country}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT: Financial Sidebar (4 Columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-auth-navy text-white border-none shadow-xl">
                        <p className="text-tiny font-bold opacity-60 uppercase mb-2">Projected Monthly Yield</p>
                        <h2 className="text-3xl text-white mb-6">${building.monthlyyield?.toLocaleString()}</h2>

                        <div className="space-y-3">
                            <Button className="w-full bg-sol-emerald hover:bg-sol-emerald/90 text-white font-bold h-12">
                                Collect All Rent
                            </Button>
                            <Button variant="outline" className="w-full hover:bg-white/10 text-black h-12">
                                View Wallet Address
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-none shadow-sm">
                        <h6 className="text-auth-navy font-bold mb-4">Quick Stats</h6>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-surface-secondary rounded-lg text-center">
                                <Users size={16} className="mx-auto mb-1 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase">Retention</p>
                                <p className="font-bold text-auth-navy">92%</p>
                            </div>
                            <div className="p-3 bg-surface-secondary rounded-lg text-center">
                                <Wallet size={16} className="mx-auto mb-1 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase">Avg Rent</p>
                                <p className="font-bold text-auth-navy">$2.1k</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}