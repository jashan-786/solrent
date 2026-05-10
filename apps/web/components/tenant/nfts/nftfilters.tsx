export const NFTFilters = () => (
    <div className="flex flex-wrap items-center gap-2 mb-8">
        {["All", "Lease NFTs", "Rent Paid NFTs", "Badges"].map((filter, i) => (
            <button
                key={filter}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${i === 0 ? "bg-black text-white" : "bg-gray-100 text-text-muted hover:bg-gray-200"
                    }`}
            >
                {filter}
            </button>
        ))}
    </div>
);