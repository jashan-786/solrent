import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

export function PaymentFilters() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search hashes or tenants..."
                    className="pl-12 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-sol-indigo"
                />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-sm">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-sm">
                    <Download className="h-4 w-4" /> Export
                </Button>
            </div>
        </div>
    );
}