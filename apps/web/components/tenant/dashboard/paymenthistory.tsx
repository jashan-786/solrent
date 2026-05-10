import { Button } from "@repo/ui/components/ui/button";
import { FileText } from "lucide-react";

const ListItem = ({ title, sub, val, isNeg, icon: Icon, dotColor }: any) => (
    <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl mb-2 border border-transparent hover:border-gray-100 transition-all">
        <div className="flex items-center gap-3">
            {Icon ? (
                <div className="bg-solrent-surface p-2 rounded-lg text-solrent-emerald">
                    <Icon size={20} />
                </div>
            ) : (
                <div className={`w-2 h-2 rounded-full ${dotColor} ml-2 mr-1`} />
            )}
            <div>
                <p className="text-sm font-bold text-brand-navy">{title}</p>
                <p className="text-[10px] text-text-muted font-medium">{sub}</p>
            </div>
        </div>
        {val && (
            <p className={`font-bold ${isNeg ? "text-solrent-emerald" : "text-brand-navy"}`}>
                {isNeg ? `-${val}` : val}
            </p>
        )}
    </div>
);

// usage: 
export default function PaymentHistory() {
    return (
        <div className="flex flex-col gap-2 w-full ">
            <div className="flex flex-row justify-between items-center w-full">
                <h2 className="text-lg font-bold text-brand-navy">Payment History</h2>
                <Button variant={"link"}>View All</Button>
            </div>
            <ListItem title="November Rent" sub="Nov 1, 2023" val="$2,100" isNeg icon={FileText} />
        </div>
    );
}