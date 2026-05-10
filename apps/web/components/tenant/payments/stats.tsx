import { Banknote, Calendar, AlertCircle, Zap } from "lucide-react";

const StatCard = ({ title, value, subtext, icon: Icon, variant = "light" }: any) => {
    const isDark = variant === "dark";

    return (
        <div className={`rounded-xl p-6 shadow-sm border ${isDark
            ? "bg-primary-950 border-transparent text-white relative overflow-hidden"
            : "bg-white border-background-100 text-primary-900"
            }`}>
            
            {isDark && (
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Zap size={100} className="translate-x-8 translate-y-8" />
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <p className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-slate-400" : "text-text-400"
                    }`}>
                    {title}
                </p>
                <div className={isDark ? "text-secondary-400" : "text-secondary-500"}>
                    <Icon size={20} />
                </div>
            </div>

            <div>
                <h3 className="text-3xl font-bold mb-1">{value}</h3>
                <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-text-400"
                    }`}>
                    {subtext}
                </p>
            </div>
        </div>
    );
};

export const StatsOverview = ({ payments }: { payments: any[] }) => {
    const totalPaid = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const upcoming = payments.find(p => p.status === 'UPCOMING' || p.status === 'OVERDUE');
    
    const missed = payments.filter(p => p.status === 'FAILED').length;

    const stats = [
        {
            title: "Total Rent Paid",
            value: `${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${payments[0]?.stablecoin || 'USDC'}`,
            subtext: "Lifetime institutional volume",
            icon: Banknote,
        },
        {
            title: "Upcoming Payment",
            value: upcoming ? `${upcoming.amount} ${upcoming.stablecoin}` : "None",
            subtext: upcoming 
                ? `Due on ${new Date(upcoming.dueDate).toLocaleDateString()}` 
                : "No pending payments",
            icon: Calendar,
        },
        {
            title: "Failed Payments",
            value: missed.toString(),
            subtext: missed === 0 ? "Perfect payment record" : `${missed} issues detected`,
            icon: AlertCircle,
        },
        {
            title: "Auto-Pay Status",
            value: "Inactive",
            subtext: "Manual verification required",
            icon: Zap,
            variant: "dark",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-8">
            {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
            ))}
        </div>
    );
};