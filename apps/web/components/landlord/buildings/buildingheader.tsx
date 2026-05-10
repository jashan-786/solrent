import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { PersonStanding, SortAsc, TowerControl } from "lucide-react"

export default function BuildingHeader() {

    const data: { heading: string, value: string }[] = [
        { heading: "Total Buildings", value: "5" },
        { heading: "Portfolio Occupancy", value: "94.2%" },
        { heading: "Monthly Revvenue", value: "$284.5k" },
    ]
    return (
        <div className=" w-full flex flex-col">
            <div className=" w-full ">
                <p className="text-text-grey font-bold uppercase">Portfolio Overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3  mt-4">
                <div className=" col-span-12 md:col-span-8 md:gap-8 grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-4  ">
                        <div className="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <StatsCard heading={data[0]?.heading as string} value={data[0]?.value as string} />
                            <StatsCard heading={data[1]?.heading as string} value={data[1]?.value as string} />
                        </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 ">
                        <div className="col-span-2 grid grid-cols-1 ">
                            <StatsCard heading={data[2]?.heading as string} value={data[0]?.value as string} />
                        </div>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4 grid grid-cols-1 md:grid-cols-3 items-end">

                    <Filters />
                </div>
            </div>
        </div>
    )
}



function StatsCard({ heading, value }: { heading: string, value: string }) {
    return (
        <Card className="bg-white border-none shadow-sm">
            <CardHeader>
                <h6 className="text-auth-navy uppercase tracking-widest text-tiny">{heading}</h6>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">

                    <div>
                        <h3 className=" font-bold text-auth-navy">{value}</h3>

                    </div>
                </div>
            </CardContent>
        </Card>


    )
}

function Filters() {
    return (
        <div className="col-span-3 grid grid-cols-3   gap-3 p-3 items-end rounded-xl shadow-sm bg-background-grey ">

            <Button className="bg-white text-black"><PersonStanding></PersonStanding>Occupancy</Button>
            <Button className="bg-white text-black"><TowerControl></TowerControl>City</Button>
            <Button className="bg-white text-black"> <SortAsc></SortAsc>Sort</Button>

        </div>
    )

}


