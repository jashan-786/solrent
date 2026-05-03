import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { CircleCheckBig, Clock, ShieldCheck, Activity } from "lucide-react";

export default function BriefInfo({ lease }: { lease: any }) {
    const data = [
        {
            title: "Next Rent Due",
            value: lease ? "3 Days" : "--", 
            description: lease ? "Nov 1st, 2023" : "No lease",
            icon: <Clock size={16} className="text-text-400" />
        },
        {
            title: "Lease Status",
            value: lease ? "Active" : "None",
            description: lease ? `Expires ${new Date(lease.endDate).toLocaleDateString()}` : "Not Rented",
            icon: <ShieldCheck size={16} className="text-secondary-500" />,
        },
        {
            title: "Total Paid",
            value: lease ? `$${(lease.monthlyRent * 2).toLocaleString()}` : "$0", 
            description: "On-Chain Verified",
            icon: <CircleCheckBig size={16} className="text-secondary-500" />,
        },
        {
            title: "Auto-Pay",
            value: lease?.autoPayEnabled ? "On" : "Off",
            description: lease?.autoPayEnabled ? "Smart Contract Active" : "Manual Payment",
            icon: <Activity size={16} className={lease?.autoPayEnabled ? "text-secondary-500" : "text-text-400"} />
        }
    ];

    return (
        <div className="flex gap-4 flex-row w-full overflow-x-auto no-scrollbar pb-2">
            {data.map((item, index) => (
                <Card key={index} className="min-w-[240px] flex-1 bg-white rounded-2xl border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-500">{item.title}</CardTitle>
                        <CardDescription className="text-2xl font-extrabold text-primary-900">{item.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-xs text-text-500 font-medium">{item.description}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}   