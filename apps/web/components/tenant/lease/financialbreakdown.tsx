export const FinancialBreakdown = ({ lease }: { lease: any }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-background-100">
        <h3 className="text-xl font-bold text-primary-900 mb-6">Financial Breakdown</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-text-500">Base Rent</span>
                <span className="font-bold text-primary-900">{lease.monthlyRent} {lease.stablecoin}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-text-500">Security Deposit</span>
                <span className="font-bold text-primary-900">{lease.depositAmount || 0} {lease.stablecoin}</span>
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between items-end">
                <span className="font-bold text-primary-900 text-lg">Total Monthly</span>
                <div className="text-right">
                    <p className="text-2xl font-bold text-secondary-500">{lease.monthlyRent.toLocaleString()}</p>
                    <p className="text-xs font-bold text-secondary-500">{lease.stablecoin}</p>
                </div>
            </div>
        </div>
    </div>
);