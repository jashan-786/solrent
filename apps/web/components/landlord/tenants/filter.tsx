import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";

export default function FilterComponent() {
    return (
        <div className="flex flex-wrap p-8  items-center gap-3 py-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-grey" />
                <Input
                    placeholder="Search by name, building or unit..."
                    className="pl-10 bg-background-grey border-none h-12 rounded-xl text-base placeholder:text-text-grey"
                />
            </div>

            {/* Building Filter */}
            <Select>
                <SelectTrigger className="w-fit min-w-[160px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="All Buildings" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    <SelectItem value="b1">Building A</SelectItem>
                    <SelectItem value="b2">Building B</SelectItem>
                </SelectContent>
            </Select>

            {/* Lease Status Filter */}
            <Select>
                <SelectTrigger className="w-fit min-w-[160px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="Lease Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select>
                <SelectTrigger className="w-fit min-w-[180px] h-12 bg-surface-secondary border-none rounded-xl font-medium text-auth-navy">
                    <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
            </Select>

            {/* Advanced Filter Icon Button */}
            <Button
                variant="secondary"
                className="h-12 w-12 bg-background-grey rounded-xl p-0 hover:bg-slate-200"
            >
                <SlidersHorizontal className="h-5 w-5 text-auth-navy" />
            </Button>
        </div>
    );
}