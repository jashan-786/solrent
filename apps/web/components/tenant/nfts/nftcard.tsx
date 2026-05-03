import { ExternalLink, MoreVertical } from "lucide-react";

export default function NFTCard({ item }: any) {
    return (
        <div className="bg-primary-950 rounded-2xl p-4 flex flex-col gap-4 shadow-xl border border-primary-800">
            {/* NFT Image Wrapper */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-linear-to-br from-primary-800 to-primary-950 border border-primary-700/50">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 bg-secondary-500/20 text-secondary-500 text-[9px] font-bold px-2 py-1 rounded border border-secondary-500/30 uppercase tracking-tighter">
                    {item.rarity || "Verified"}
                </span>
            </div>

            {/* Metadata */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</p>
                    <p className="text-[10px] font-mono text-slate-500">#{item.id}</p>
                </div>
                <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-auto">
                <a href="#" className="flex items-center gap-1.5 text-secondary-500 text-[11px] font-bold hover:underline">
                    View on Solscan <ExternalLink size={12} />
                </a>
                <MoreVertical size={16} className="text-slate-500 cursor-pointer" />
            </div>
        </div>
    );
}