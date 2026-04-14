import { Check, Clock, Download } from "lucide-react";

export const MilestoneHistory = () => {
    const months = [
        { m: "OCT '23", status: "completed", sub: "Lease Initiated" },
        { m: "NOV '23", status: "completed" },
        { m: "DEC '23", status: "completed" },
        { m: "JAN '24", status: "completed" },
        { m: "FEB '24", status: "completed" },
        { m: "MAR '24", status: "latest", sub: "Latest Paid" },
        { m: "APR '24", status: "pending" },
        { m: "MAY '24", status: "pending" },
    ];

    return (
        <div className="bg-white rounded-twelve p-6 md:p-8 shadow-sm border border-gray-100 mt-8">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-brand-navy text-lg">Payment Milestone History</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-solrent-emerald tracking-widest uppercase">
                    <div className="w-2 h-2 rounded-full bg-solrent-emerald animate-pulse" />
                    On-Chain Verified Chain
                </div>
            </div>

            <div className="relative flex items-center justify-between overflow-x-auto pb-6 no-scrollbar min-w-full">
                {/* The Connection Line */}
                <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-solrent-emerald/30 z-0" />

                {months.map((item, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-4 min-w-[80px]">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${item.status === 'completed' ? 'bg-solrent-emerald text-brand-navy' :
                                item.status === 'latest' ? 'bg-solrent-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)] text-brand-navy' :
                                    'bg-gray-100 text-slate-400'
                            }`}>
                            {item.status === 'pending' ? <Clock size={18} /> : <Check size={18} strokeWidth={3} />}
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-brand-navy whitespace-nowrap">{item.m}</p>
                            {item.sub && <p className="text-[9px] text-solrent-emerald font-bold absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">{item.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-50 gap-4">
                <p className="text-xs italic text-text-muted italic">"Exceptional payment reliability. Current streak: 6 months."</p>
                <button className="flex items-center gap-2 text-xs font-bold text-brand-navy hover:text-solrent-emerald transition-colors">
                    Download Full History <Download size={14} />
                </button>
            </div>
        </div>
    );
};