export interface PaymentProps {
    id: number;
    title: string;
    description: string;
    image: string;
    type: string;
    rarity: string;
}

export type NFTDataProps = {
    id: number;
    title: string;
    description: string;
    image: string;
    type: string;
    rarity: string;
}

export type ReceiptsProps = {
    id: string,
    title: string,
    description: string,
    type: string,
    rarity: string,
    status: string,
    amount: number,
    stablecoin: string,
    dueDate: Date,
    paidAt: Date | null,
    transactionHash: string | null,
    nftReceiptMint: string | null,
    building: string,
    unit: string
}

export type MilestonesProps = {
    month: string;
    status: string;
}