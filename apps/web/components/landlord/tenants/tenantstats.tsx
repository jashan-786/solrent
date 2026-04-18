import { Users, BarChart3, CalendarX, Wallet } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const StatCard = ({ label, value, icon, iconBg, iconColor }: StatCardProps) => (
    <div className="flex items-center justify-between p-6 bg-[#F7F9FB] rounded-2xl  shadow-sm hover:shadow-md transition-all w-full">
        <div className="space-y-1">
            <p className="text-xs font-bold text-auth-slate uppercase tracking-wider">
                {label}
            </p>
            <h3 className="text-3xl font-bold text-auth-navy">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
            {icon}
        </div>
    </div>
);

export default function TenantStats() {
    const stats = [
        {
            label: "Total Tenants",
            value: "142",
            icon: <Users size={24} />,
            iconBg: "bg-background-grey",
            iconColor: "text-auth-navy",
        },
        {
            label: "Occupancy Rate",
            value: "94.2%",
            icon: <BarChart3 size={24} />,
            iconBg: "bg-[#D1FAE5]", // Soft green
            iconColor: "text-[#059669]",
        },
        {
            label: "Expiring Soon",
            value: "8",
            icon: <CalendarX size={24} />,
            iconBg: "bg-[#FEE2E2]", // Soft red
            iconColor: "text-[#DC2626]",
        },
        {
            label: "Wallet Synced",
            value: "89%",
            icon: <Wallet size={24} />,
            iconBg: "bg-[#DBEAFE]", // Soft blue
            iconColor: "text-[#2563EB]",
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