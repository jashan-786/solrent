export interface Building {
    id: string;
    img: string;
    name: string;
    address: string;
    city: string;
    units: number;
    state: string;
    monthlyyield?: number;
    actualYield?: number;
    zip: string;
    country: string;
    occupied: number;
}
export interface CTAEmptyStateProps {
    title: string;
    description: string;
    buttonText: string;
    onAction: () => void;
    icon?: React.ReactNode;
}

export interface MappedBuildings {
    occupied: number;
    monthlyyield: number;
    img: string;
    _count: {
        units: number;
    };

    units: {
        rentAmount: number;
        occupied: boolean;
    }[];

    name: string;
    id: string;
    landlordId: string;
    createdAt: Date;
    updatedAt: Date;
    address: string;
    city: string;
    province: string;
    postalCode: string;
}
