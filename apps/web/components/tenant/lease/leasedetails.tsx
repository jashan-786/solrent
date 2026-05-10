import { MapPin } from "lucide-react";

export const LeaseDetailsCard = () => {
    return (
        <div className="bg-white rounded-twelve p-8 shadow-sm border border-gray-100 relative overflow-hidden flex-1 rounded-[12px]">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-solrent-emerald/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="relative z-10 ">
                <h2 className="text-3xl font-bold text-brand-navy mb-2">Skyline Residences #402</h2>
                <p className="flex items-center gap-1 text-text-muted text-sm mb-10">
                    <MapPin size={16} /> 450 Financial District, New York, NY
                </p>

                <div className="grid grid-cols-3 gap-8 rounded-[12px]" >
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Landlord</p>
                        <p className="text-xl font-bold text-brand-navy">Alex Rivera</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Monthly Rent</p>
                        <p className="text-xl font-bold text-brand-navy">2,450 USDC</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Duration</p>
                        <p className="text-xl font-bold text-brand-navy">12 Months</p>
                    </div>
                </div>
            </div>
        </div>
    );
};