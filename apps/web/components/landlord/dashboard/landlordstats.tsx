import { Banknote, DoorOpen, ClipboardList, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export const LandlordStats = () => {
    const stats = [
        { title: "Total Rent", value: "$437,600", icon: Banknote, trend: "+12.5%", color: "text-secondary-500" },
        { title: "Occupancy", value: "92.8%", icon: DoorOpen, color: "text-text-950" },
        { title: "Pending Actions", value: "14", icon: ClipboardList, color: "text-destructive", alert: true },
        { title: "Active Leases", value: "89", icon: FileText, color: "text-text-950" },
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
                        {stat.trend && (
                            <p className="text-tiny font-medium text-secondary-500 mt-1">
                                {stat.trend} <span className="text-text-500">vs last month</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};