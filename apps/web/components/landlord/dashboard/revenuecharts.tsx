import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";

export const RevenueChart = () => {
    const data = [
        { m: "Jan", h: "40%" }, { m: "Feb", h: "55%" }, { m: "Mar", h: "45%" },
        { m: "Apr", h: "75%" }, { m: "May", h: "100%", active: true }, { m: "Jun", h: "85%" },
    ];

    return (
        <Card className="bg-card border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <h5 className="text-auth-navy">Revenue Performance</h5>
                    <p className="text-sm text-text-grey">Growth across all property NFTs</p>
                </div>
                <div className="bg-surface-secondary text-text-grey text-tiny font-bold px-3 py-1 rounded-full">
                    YEAR TO DATE
                </div>
            </CardHeader>
            <CardContent className="pt-10">
                {/* This is the 200px tall container */}
                <div className="flex items-end justify-between h-[200px] gap-2 px-2 relative">
                    {data.map((bar) => (
                        <div key={bar.m} className="flex flex-col items-center gap-4 w-full h-full relative group cursor-pointer justify-end">
                            {bar.active && (
                                <div className="absolute -top-10 z-10">
                                    <div className="bg-sol-emerald text-white text-tiny font-bold px-2 py-1 rounded whitespace-nowrap">
                                        Peak: $82k (SOL)
                                    </div>
                                </div>
                            )}

                            {/* FIX: Added 'h-full' to the wrapper above and ensure this div 
                   is positioned correctly. 
                */}
                            <div
                                className={`w-full max-w-[40px] rounded-md transition-all duration-500 ${bar.active ? "bg-sol-emerald" : "bg-surface-secondary hover:bg-sol-emerald"
                                    }`}
                                style={{ height: bar.h }} // height: 40% now works because parent is 200px
                            />

                            <span className="text-tiny font-bold text-text-grey uppercase">{bar.m}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};  