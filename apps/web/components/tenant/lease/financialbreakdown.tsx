export const FinancialBreakdown = () => (
    <div className="bg-white rounded-twelve p-6 shadow-sm border border-gray-100 rounded-[12px]">
        <h3 className="text-xl font-bold text-brand-navy mb-6">Financial Breakdown</h3>
        <div className="space-y-4">
            {[
                { label: "Base Rent", val: "2,100.00 USDC" },
                { label: "Amenities (Pool/Gym)", val: "250.00 USDC" },
                { label: "Insurance Premium", val: "100.00 USDC" },
            ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="font-bold text-brand-navy">{item.val}</span>
                </div>
            ))}
            <div className="pt-4 border-t border-dashed flex justify-between items-end ">
                <span className="font-bold text-brand-navy text-lg">Total Monthly</span>
                <div className="text-right">
                    <p className="text-2xl font-bold text-sol-emerald">2,450.00</p>
                    <p className="text-xs font-bold text-sol-emerald">USDC</p>
                </div>
            </div>
        </div>
    </div>
);