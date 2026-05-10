import { MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
interface PropertyHeaderProps {
    title: string;
    address: string;
    image: string;
    stats: {
        label: string;
        val: string;
    }[];
}
export default function PropertyHeader({ title, address, image, stats }: PropertyHeaderProps) {
    return (
        <div className="bg-white rounded-twelve p-8 flex flex-col md:flex-row gap-6 shadow-sm border border-gray-100 rounded-[12px] h-full">
            <div className="w-full md:w-1/3 h-48 rounded-lg overflow-hidden relative">

                <Image src="/building-landing.png" alt="building" width={1000} height={1000} className="w-full h-auto object-contain rounded-2xl" />

            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-text-950">Unit 14B - Skyline Azure</h2>
                        <p className="flex items-center gap-1 text-text-500 text-sm mt-1">
                            <MapPin size={14} /> 782 Ocean Drive, Miami FL
                        </p>
                    </div>
                    <span className="bg-secondary-500/20 text-secondary-500 text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                        Premium Suite
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                        { label: "BEDROOM", val: "2.5 Bath" },
                        { label: "SQ. FOOTAGE", val: "1,450 ft²" },
                        { label: "SECURITY", val: "Smart Lock" }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-background-100 p-3 rounded-lg">
                            <p className="text-[10px] text-text-500 font-bold uppercase">{stat.label}</p>
                            <p className="text-sm font-bold text-text-950">{stat.val}</p>
                        </div>
                    ))}
                </div>

                <button className="mt-6 text-secondary-500 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    Request Maintenance <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}