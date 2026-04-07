import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function Hero() {
    return (
        <section className="w-full h-full  flex flex-col items-center  bg-gray-100 px-4 md:px-8 py-10">
            <div >
                <h2 className="text-center">Institutional Features</h2>
                <div className="flex flex-row justify-center">
                    <p className="text-center w-1/2">Built for property managers who demand precision and speed. The Editorial Ledger provides the infrastructure for the next generation of real estate.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row w-full md:w-3/4">

                <Card className="w-full md:w-1/2">
                    <CardHeader>
                        <CardTitle>SolRent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The Editorial Ledger provides the infrastructure for the next generation of real estate.</p>
                    </CardContent>
                </Card>
                <Card className="w-full md:w-1/2">
                    <CardHeader>
                        <CardTitle>SolRent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The Editorial Ledger provides the infrastructure for the next generation of real estate.</p>
                    </CardContent>
                </Card>

                <Card className="w-full md:w-1/2">
                    <CardHeader>
                        <CardTitle>SolRent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The Editorial Ledger provides the infrastructure for the next generation of real estate.</p>
                    </CardContent>
                </Card>

            </div>
        </section>
    );
}   