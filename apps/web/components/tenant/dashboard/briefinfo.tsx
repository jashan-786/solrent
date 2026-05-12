import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { CircleCheckBig, Clock, ShieldCheck, Activity } from "lucide-react";

import { AutoPayModal } from "./autopaymodal";

export default function BriefInfo({ lease, nextPayment, mutateDashboard }: { lease: any, nextPayment?: any, mutateDashboard?: () => void }) {
    
    const getDaysUntilDue = () => {
        if (!nextPayment?.dueDate) return "--";
        const now = new Date();
        const due = new Date(nextPayment.dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "Overdue";
        if (diffDays === 0) return "Today";
        return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
    };

    const getDueDateFormatted = () => {
        if (!nextPayment?.dueDate) return "No lease";
        return new Date(nextPayment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const data = [
        {
            title: "Next Rent Due",
            value: getDaysUntilDue(),
            description: getDueDateFormatted(),
            icon: <Clock size={16} className="text-text-400" />
        },
        {
            title: "Lease Status",
            value: lease ? (lease.status === "PENDING" ? "Pending" : "Active") : "None",
            description: lease ? (lease.status === "PENDING" ? "Awaiting your signature" : `Expires ${lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}`) : "Not Rented",
            icon: lease?.status === "PENDING" ? <Clock size={16} className="text-secondary-500 animate-pulse" /> : <ShieldCheck size={16} className="text-secondary-500" />,
        },
        {
            title: "Monthly Rent",
            value: lease ? `${(lease.monthlyRent || 0).toLocaleString()} ${lease.stablecoin || "USDC"}` : "0 USDC",
            description: "On-Chain Verified",
            icon: <CircleCheckBig size={16} className="text-secondary-500" />,
        },
        {
            title: "Auto-Pay",
            value: lease?.autoPayEnabled ? "On" : "Off",
            description: lease?.autoPayEnabled ? "Smart Contract Active" : "Manual Payment",
            icon: <Activity size={16} className={lease?.autoPayEnabled ? "text-secondary-500" : "text-text-400"} />,
            action: lease && lease.landlordWallet ? <div className="mt-4"><AutoPayModal lease={lease} buildingWallet={lease.landlordWallet} onSync={mutateDashboard} /></div> : null
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
                        {item.action}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}