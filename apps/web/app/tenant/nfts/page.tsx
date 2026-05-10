"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { MilestoneHistory } from "@/components/tenant/nfts/milestonetimeline";
import NFTCard from "@/components/tenant/nfts/nftcard";
import { NFTFilters } from "@/components/tenant/nfts/nftfilters";
import { Loader2, Sparkles } from "lucide-react";
import { MilestonesProps, ReceiptsProps } from "@repo/types";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Nfts() {
    const { data, isLoading } = useSWR("/api/tenant/receipts", fetcher);
    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const allReceipts: ReceiptsProps[] = data?.receipts || [];
    const milestones: MilestonesProps[] = data?.milestones || [];
    const streak: number = data?.streak || 0;

    const itemsPerPage = 8;

    const receipts = allReceipts.filter((receipt: any) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Lease NFTs") return receipt.type === "Lease NFT";
        if (activeFilter === "Rent Paid NFTs") return receipt.type !== "Lease NFT";
        if (activeFilter === "Badges") return receipt.rarity === "Legendary" || receipt.rarity === "Mythic";
        return true;
    });

    const totalPages = Math.ceil(receipts.length / itemsPerPage);
    const paginatedReceipts = receipts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-primary-900 mb-2 tracking-tight">Collectible Receipts</h1>
                    <p className="text-text-500 max-w-xl text-sm leading-relaxed font-medium">
                        Your rental history verified on the Solana blockchain. Each receipt represents a secured milestone in your leasing journey.
                    </p>
                </div>
                <NFTFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>

            {receipts.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-background-100 p-16 text-center shadow-sm">
                    <div className="flex justify-center mb-6">
                        <div className="p-6 bg-background-50 rounded-full">
                            <Sparkles className="h-10 w-10 text-text-300" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-primary-900 mb-2">
                        {activeFilter === "All" ? "No Receipts Yet" : `No ${activeFilter} Found`}
                    </h3>
                    <p className="text-text-400 text-sm max-w-md mx-auto">
                        {activeFilter === "All"
                            ? "Once your first rent payment is confirmed on the Solana blockchain, your collectible receipt will appear here."
                            : `No receipts match the "${activeFilter}" filter. Try selecting "All" to see everything.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedReceipts.map((receipt: any) => <NFTCard key={receipt.id} item={receipt} />)}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 bg-white p-4 rounded-2xl border border-background-100 shadow-sm w-fit mx-auto">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-500 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === i + 1 
                                            ? "bg-secondary-500 text-white shadow-md shadow-secondary-500/20" 
                                            : "text-text-400 hover:bg-background-50"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-500 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            <MilestoneHistory milestones={milestones} streak={streak} />
        </div>
    );
}