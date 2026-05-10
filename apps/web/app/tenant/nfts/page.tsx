import { MilestoneHistory } from "@/components/tenant/nfts/milestonetimeline";
import NFTCard from "@/components/tenant/nfts/nftcard";
import { NFTFilters } from "@/components/tenant/nfts/nftfilters";
import { NFTDataProps } from "@repo/types";

export default function Nfts() {
    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-brand-navy mb-2 tracking-tight">Collectible Receipts</h1>
                    <p className="text-text-muted max-w-xl text-sm leading-relaxed">
                        Your rental history verified on the Solana blockchain. Each NFT represents a secured milestone in your leasing journey.
                    </p>
                </div>
                <NFTFilters />
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {NFT_DATA.map((nft: NFTDataProps) => <NFTCard key={nft.id} item={nft} />)}
            </div>

            <MilestoneHistory />
        </div>
    );
}

const NFT_DATA: NFTDataProps[] = [
    {
        id: 1,
        title: "Lease Agreement NFT",
        description: "Lease Agreement NFT",
        image: "/images/nft.png",
        type: "Lease NFT",
        rarity: "Legendary",
    },
    {
        id: 2,
        title: "Rent Paid NFT",
        description: "Rent Paid NFT",
        image: "/images/nft.png",
        type: "Rent Paid NFT",
        rarity: "Rare",
    },
    {
        id: 3,
        title: "Badge NFT",
        description: "Badge NFT",
        image: "/images/nft.png",
        type: "Badge NFT",
        rarity: "Common",
    },
    {
        id: 4,
        title: "Lease Agreement NFT",
        description: "Lease Agreement NFT",
        image: "/images/nft.png",
        type: "Lease NFT",
        rarity: "Legendary",
    },
    {
        id: 5,
        title: "Rent Paid NFT",
        description: "Rent Paid NFT",
        image: "/images/nft.png",
        type: "Rent Paid NFT",
        rarity: "Rare",
    },
    {
        id: 6,
        title: "Badge NFT",
        description: "Badge NFT",
        image: "/images/nft.png",
        type: "Badge NFT",
        rarity: "Common",
    },
    {
        id: 7,
        title: "Lease Agreement NFT",
        description: "Lease Agreement NFT",
        image: "/images/nft.png",
        type: "Lease NFT",
        rarity: "Legendary",
    },
    {
        id: 8,
        title: "Rent Paid NFT",
        description: "Rent Paid NFT",
        image: "/images/nft.png",
        type: "Rent Paid NFT",
        rarity: "Rare",
    },
    {
        id: 9,
        title: "Badge NFT",
        description: "Badge NFT",
        image: "/images/nft.png",
        type: "Badge NFT",
        rarity: "Common",
    },
    {
        id: 10,
        title: "Lease Agreement NFT",
        description: "Lease Agreement NFT",
        image: "/images/nft.png",
        type: "Lease NFT",
        rarity: "Legendary",
    },
    {
        id: 11,
        title: "Rent Paid NFT",
        description: "Rent Paid NFT",
        image: "/images/nft.png",
        type: "Rent Paid NFT",
        rarity: "Rare",
    },
    {
        id: 12,
        title: "Badge NFT",
        description: "Badge NFT",
        image: "/images/nft.png",
        type: "Badge NFT",
        rarity: "Common",
    },
];