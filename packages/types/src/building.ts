export interface Building {
    id: string;
    img: string;
    name: string;
    address: string;
    city: string;
    units: number;
    state: string;
    monthlyyield?: number;
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
