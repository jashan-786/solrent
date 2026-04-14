import { Banknote, Calendar, AlertCircle, Zap } from "lucide-react";

const StatCard = ({ title, value, subtext, icon: Icon, variant = "light" }: any) => {
    const isDark = variant === "dark";

    return (
        <div className={`rounded-twelve p-6 shadow-sm border rounded-[12px] ${isDark
            ? "bg-brand-navy border-transparent text-white relative overflow-hidden"
            : "bg-white border-gray-100 text-brand-navy"
            }`}>
            {/* Dark variant background decoration */}
            {isDark && (
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Zap size={100} className="translate-x-8 translate-y-8" />
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <p className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-slate-400" : "text-text-muted"
                    }`}>
                    {title}
                </p>
                <div className={isDark ? "text-solrent-emerald" : "text-solrent-emerald"}>
                    <Icon size={20} />
                </div>
            </div>

            <div>
                <h3 className="text-3xl font-bold mb-1">{value}</h3>
                <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-text-muted"
                    }`}>
                    {subtext}
                </p>
            </div>
        </div>
    );
};

export const StatsOverview = () => {
    const stats = [
        {
            title: "Total Rent Paid",
            value: "742.5 SOL",
            subtext: "Lifetime institutional volume",
            icon: Banknote,
        },
        {
            title: "Upcoming Payment",
            value: "45.0 SOL",
            subtext: <>Due in <span className="text-solrent-emerald">4 days</span></>,
            icon: Calendar,
        },
        {
            title: "Missed Payments",
            value: "0",
            subtext: "Perfect payment record",
            icon: AlertCircle,
        },
        {
            title: "Auto-Pay Status",
            value: "Enabled",
            subtext: "Deducted from Phantom Wallet",
            icon: Zap,
            variant: "dark",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
            ))}
        </div>
    );
};