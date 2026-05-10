export type FailedTxnsProps = {
    id: number;
    period: string;
    amount: string;
    usd: string;
    status: string;
    action: string;
}

export type LeaseProps = {
    id: number;
    period: string;
    amount: string;
    usd: string;
    status: string;
    action: string;
}

export type LeaseStatus = "ACTIVE" | "EXPIRED" | "TERMINATED" | "PENDING";

export type PaymentStatus = "UPCOMING" | "PENDING" | "PAID" | "LATE" | "OVERDUE";