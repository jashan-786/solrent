"use client"

import { Button } from "@repo/ui/components/ui/button";

export default function TenantIntro() {
    return (
        <div className=" flex flex-row justify-between items-center w-full py-4 md:py-6">
            <div className="flex flex-col">
                <small className="text-text-grey">Tenant Overview</small>
                <h3 className="text-auth-navy">Welcome Home, Alex</h3>
            </div>
            <div className="flex gap-2">
                <Button variant={"outline"} className="rounded-lg bg-secondary-grey">View Lease</Button>
                <Button variant={"default"} className="rounded-lg">Pay Now</Button>
            </div>
        </div>
    );
}