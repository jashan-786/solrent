import { Progress } from "@repo/ui/components/ui/progress";
import { Card } from "@repo/ui/components/ui/card";

export const OccupancyTracker = (props: { units: any[] }) => (
    <Card className="border-none shadow-sm p-6">
        <h3 className="text-sm font-bold text-brand-navy mb-6 uppercase tracking-wider">Asset Occupancy</h3>
        <div className="space-y-6">
            {props.units.map((item: any) => (
                <OccupancyComponent 
                    key={item.id} 
                    name={`${item.buildingName} #${item.unitNumber}`} 
                    percentage={item.occupied ? 100 : 0} 
                />
            ))}
        </div>
    </Card>
);

const OccupancyComponent = ({ name, percentage }: { name: string, percentage: number }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span>{name}</span>
                <span className="text-solrent-emerald">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-1.5 bg-gray-100" />
        </div>
    )
}