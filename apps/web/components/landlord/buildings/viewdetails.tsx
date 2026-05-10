"use client"
import { Building } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";

export default function ViewDetailsButton({ building }: { building: Building }) {
    const router = useRouter();
    return (
        <Button
            onClick={() => router.push(`/landlord/buildings/${building.id}`)}
            className="flex-1 text-sm bg-background-grey hover:bg-slate-200 text-auth-navy font-bold rounded-xl h-12"
        >
            View Details
        </Button>
    )
}