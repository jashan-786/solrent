import { Check, Clock, Download } from "lucide-react";
import { Separator } from "@repo/ui/components/ui/separator";

interface MilestoneProps {
    milestones: { month: string; status: string }[];
    streak: number;
}

export const MilestoneHistory = ({ milestones, streak }: MilestoneProps) => {
    if (!milestones || milestones.length === 0) return null;

    const latestCompletedIdx = milestones.findIndex(m => m.status === "completed");
    const processedMilestones = milestones.map((m, i) => ({
        ...m,
        status: i === latestCompletedIdx && m.status === "completed" ? "latest" : m.status
    }));

    return (
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-background-100 mt-10">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-primary-900 text-xl">Payment Milestone History</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-secondary-500 tracking-widest uppercase">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                    On-Chain Verified
                </div>
            </div>

            <div className="relative flex items-center justify-between overflow-x-auto pb-6 no-scrollbar min-w-full">
                <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-secondary-500/20 z-0" />

                {processedMilestones.map((item, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-4 min-w-[80px]">
                        <div className={`w-11 h-11 rounded-xl flex items-center border-white border-2 justify-center transition-all ${
                            item.status === 'completed' ? 'bg-secondary-300 text-primary-900' :
                            item.status === 'latest' ? 'bg-secondary-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] text-primary-900' :
                            'bg-background-100 text-text-300'
                        }`}>
                            {item.status === 'pending' ? (
                                <Clock size={18} />
                            ) : (
                                <div className="bg-white rounded-lg p-0.5">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-primary-900 whitespace-nowrap">{item.month}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="bg-background-100" />

            <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 gap-4">
                <p className="text-sm text-text-400 italic font-medium">
                    {streak > 0
                        ? `"Exceptional payment reliability. Current streak: ${streak} month${streak > 1 ? 's' : ''}."`
                        : `"Start building your on-chain payment reputation."`
                    }
                </p>
                <button className="flex items-center gap-2 text-xs font-black text-primary-900 hover:text-secondary-500 transition-colors uppercase tracking-wider">
                    Download Full History <Download size={14} />
                </button>
            </div>
        </div>
    );
};