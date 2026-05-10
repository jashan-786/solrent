import { Progress } from "@repo/ui/components/ui/progress";
import { Card } from "@repo/ui/components/ui/card";

export const OccupancyTracker = () => (
    <Card className="border-none shadow-sm p-6">
        <h3 className="text-sm font-bold text-brand-navy mb-6 uppercase tracking-wider">Asset Occupancy</h3>
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span>Skyline Lofts</span>
                    <span className="text-solrent-emerald">100%</span>
                </div>
                <Progress value={100} className="h-1.5 bg-gray-100" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span>Harbor Point</span>
                    <span>88%</span>
                </div>
                <Progress value={88} className="h-1.5 bg-gray-100" />
            </div>
        </div>
    </Card>
);