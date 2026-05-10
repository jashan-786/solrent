import { Users, BarChart3, CalendarX, Wallet } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const StatCard = ({ label, value, icon, iconBg, iconColor }: StatCardProps) => (
    <div className="flex items-center justify-between p-6 bg-background-100 rounded-2xl  shadow-sm hover:shadow-md transition-all w-full">
        <div className="space-y-1">
            <p className="text-xs font-bold text-text-700 uppercase tracking-wider">
                {label}
            </p>
            <h3 className="text-3xl font-bold text-text-950">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
            {icon}
        </div>
    </div>
);

export default function LeaseStats() {
    const stats = [
        {
            label: "Total Leases",
            value: "142",
            icon: <Users size={24} />,
            iconBg: "bg-background-200",
            iconColor: "text-text-950",
        },
        {
            label: "Occupancy Rate",
            value: "94.2%",
            icon: <BarChart3 size={24} />,
            iconBg: "bg-primary-100", // Soft primary
            iconColor: "text-primary-700",
        },
        {
            label: "Expiring Soon",
            value: "8",
            icon: <CalendarX size={24} />,
            iconBg: "bg-secondary-100", // Soft secondary
            iconColor: "text-secondary-600",
        },
        {
            label: "Wallet Synced",
            value: "89%",
            icon: <Wallet size={24} />,
            iconBg: "bg-primary-100", // Soft primary
            iconColor: "text-primary-600",
        },
    ];

    return (
        <div className="grid p-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}