"use client";

interface NFTFiltersProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
}

export const NFTFilters = ({ activeFilter, setActiveFilter }: NFTFiltersProps) => (
    <div className="flex flex-wrap items-center gap-2 mb-8">
        {["All", "Lease NFTs", "Rent Paid NFTs", "Badges"].map((filter) => (
            <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? "bg-black text-white" : "bg-gray-100 text-text-muted hover:bg-gray-200"
                    }`}
            >
                {filter}
            </button>
        ))}
    </div>
);