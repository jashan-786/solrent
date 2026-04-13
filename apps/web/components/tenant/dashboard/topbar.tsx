import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

export default function TenantDashboardTopbar() {
    return (
        <div className="flex gap-2 w-full">
            <div className="w-3/4 flex gap-2">
                <Input placeholder="Search" className="w-1/2" />
                <Button className="">Search</Button>
            </div>
            <div className="w-1/4 flex justify-end">
                <Button variant={"default"} className="">Connected Wallets</Button>
            </div>
        </div >
    );
}
