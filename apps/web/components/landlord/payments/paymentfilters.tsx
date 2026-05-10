"use client";

import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";

interface PaymentFiltersProps {
    search: string;
    setSearch: (search: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    onExport: () => void;
}

export function PaymentFilters({ search, setSearch, statusFilter, setStatusFilter, onExport }: PaymentFiltersProps) {

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search name, email or transaction..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-sol-indigo"
                />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-sm min-w-[140px]">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="UPCOMING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                </Select>
                <Button 
                    variant="outline" 
                    className="h-12 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-sm"
                    onClick={onExport}
                >
                    <Download className="h-4 w-4" /> Export
                </Button>
            </div>
        </div>
    );
}