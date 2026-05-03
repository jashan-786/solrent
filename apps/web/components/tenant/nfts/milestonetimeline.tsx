import { Check, Clock, Download } from "lucide-react";
import { Separator } from "@repo/ui/components/ui/separator";

export const MilestoneHistory = () => {
    const months = [
        { m: "OCT '23", status: "completed" },
        { m: "NOV '23", status: "completed" },
        { m: "DEC '23", status: "completed" },
        { m: "JAN '24", status: "completed" },
        { m: "FEB '24", status: "completed" },
        { m: "MAR '24", status: "latest" },
        { m: "APR '24", status: "pending" },
        { m: "MAY '24", status: "pending" },
    ];

    return (
        <div className="bg-white rounded-[12px] p-6 md:p-8 shadow-sm border border-gray-100 mt-8">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-primary-900 text-lg">Payment Milestone History</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-secondary-500 tracking-widest uppercase">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                    On-Chain Verified Chain
                </div>
            </div>

            <div className="relative flex items-center justify-between overflow-x-auto pb-6 no-scrollbar min-w-full">
                {/* The Connection Line */}
                <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-secondary-500/30 z-0" />

                {months.map((item, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-4 min-w-[80px] ">
                        <div className={`w-11 h-11 rounded-lg flex items-center   border-white  border-2 justify-center transition-all ${item.status === 'completed' ? 'bg-secondary-300 text-primary-900' :
                            item.status === 'latest' ? 'bg-secondary-300 shadow-[0_0_15px_rgba(108,248,187,0.5)] text-primary-900' :
                                'bg-gray-100 text-slate-400'
                            }`}>
                            {item.status === 'pending' ? <div className="flex flex-col items-center justify-center rounded-lg"><Clock size={18} /></div> : <div className="bg-white rounded-lg"><Check size={18} strokeWidth={3} /></div>}

                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-primary-900 whitespace-nowrap">{item.m}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="bg-green-back" />

            <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-50 gap-4">
                <p className="text-sm text-text-muted italic">"Exceptional payment reliability. Current streak: 6 months."</p>
                <button className="flex items-center gap-2 text-xs font-bold text-primary-900 hover:text-secondary-500 transition-colors">
                    Download Full History <Download size={14} />
                </button>
            </div>
        </div>
    );
};