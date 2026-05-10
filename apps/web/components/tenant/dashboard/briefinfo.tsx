import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { CircleCheckBig, CircleSmall } from "lucide-react";

export default function BriefInfo() {
    return (
        <div className="flex gap-2 flex-row w-full">
            {data.map((item, index) => (
                <Card key={index} className="w-[300px] bg-white rounded-2xl border-none">
                    <CardHeader>
                        <CardTitle className="text-sm md:text-base text-text-600">{item.title}</CardTitle>
                        <CardDescription className="text-lg md:text-4xl font-extrabold text-text-900">{item.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-row gap-2">
                            {item.icon}
                            {item.title === "Wallet Balance" ? <div className="text-secondary-500 font-semibold">verified</div> : ""}
                            <CardDescription>{item.description}</CardDescription>
                        </div>
                    </CardContent>
                </Card>

            ))}

        </div>
    );
}

interface BriefInfoData {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

const data: BriefInfoData[] = [
    {
        title: "Next Rent Due",
        value: "4 Days",
        description: "Remaining until Oct 1",
        icon: ""
    },
    {
        title: "Lease Status",
        value: "Active",
        description: "expires on Dec 31, 2026",
        icon: "",
    },
    {
        title: "Wallet Balance",
        value: "$2,500 USDC",
        description: "",
        icon: <CircleCheckBig />,
    },
    {
        title: "Auto-Pay",
        value: "Active",
        description: "",
        icon: <CircleSmall size={24} className="text-secondary-500" absoluteStrokeWidth />
    }

]   