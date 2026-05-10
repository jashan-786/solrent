import { ExternalLink, MoreVertical, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function NFTCard({ item }: { item: any }) {
    const statusIcon = () => {
        switch (item.status) {
            case "COMPLETED": return <CheckCircle2 size={14} className="text-secondary-500" />;
            case "FAILED": return <XCircle size={14} className="text-destructive" />;
            default: return <Clock size={14} className="text-amber-400" />;
        }
    };

    const rarityColor = () => {
        switch (item.rarity) {
            case "Legendary": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "Rare": return "bg-secondary-500/20 text-secondary-500 border-secondary-500/30";
            default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    return (
        <div className="bg-primary-950 rounded-2xl p-4 flex flex-col gap-4 shadow-xl border border-primary-800 group hover:border-primary-700 transition-all duration-300">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-linear-to-br from-primary-800 to-primary-950 border border-primary-700/50 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-br from-secondary-500/5 via-transparent to-accent-500/5" />
                <div className="flex flex-col items-center gap-3 p-6 text-center relative z-10">
                    <div className="text-4xl font-black text-white/90 tracking-tighter leading-none">
                        {item.amount}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        {item.stablecoin}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
                        {statusIcon()}
                        <span className="text-slate-400">{item.status}</span>
                    </div>
                </div>
                <span className={`absolute top-3 right-3 text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${rarityColor()}`}>
                    {item.rarity}
                </span>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</p>
                    <p className="text-[10px] font-mono text-slate-500">{item.id.slice(0, 8)}</p>
                </div>
                <h3 className="text-white font-bold text-base leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-auto">
                {item.transactionHash ? (
                    <a
                        href={`https://solscan.io/tx/${item.transactionHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-secondary-500 text-[11px] font-bold hover:underline transition-colors"
                    >
                        View on Solscan <ExternalLink size={12} />
                    </a>
                ) : (
                    <span className="text-[11px] text-slate-500 italic font-medium">Awaiting confirmation</span>
                )}
                <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
            </div>
        </div>
    );
}