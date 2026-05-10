import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";


export const RevenueChart = ({ revenueData }: { revenueData?: any[] }) => {
    const defaultData = [
        { m: "Jan", h: "40%", amount: 0, active: false }, { m: "Feb", h: "55%", amount: 0, active: false },
        { m: "Mar", h: "45%", amount: 0, active: false }, { m: "Apr", h: "75%", amount: 0, active: false },
        { m: "May", h: "100%", amount: 0, active: true }, { m: "Jun", h: "85%", amount: 0, active: false },
    ];

    const data = revenueData && revenueData.length > 0 ? revenueData : defaultData;

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
                <div className="flex items-end justify-between h-[200px] gap-2 px-2 relative">
                    {data.map((bar: any, index: number) => (
                        <div key={`${bar.m}-${index}`} className="flex flex-col items-center gap-3 w-full h-full relative group cursor-pointer justify-end pt-10">
                            {bar.active && bar.amount > 0 && (
                                <div className="absolute top-0 z-10">
                                    <div className="bg-sol-emerald text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                                        {bar.amount} USDC
                                    </div>
                                </div>
                            )}

                            <div className="w-full flex-1 flex flex-col justify-end items-center mt-2">
                                <div
                                    className={`w-full max-w-[40px] rounded-md transition-all duration-500 ${bar.active ? "bg-sol-emerald" : "bg-surface-secondary hover:bg-sol-emerald"
                                        }`}
                                    style={{ height: bar.h }}
                                />
                            </div>

                            <span className="text-tiny font-bold text-text-grey uppercase">{bar.m}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};  