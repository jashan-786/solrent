export const PaymentSchedule = ({ payments }: { payments: any[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-background-100 overflow-hidden">
        <div className="p-6 border-b border-background-100">
            <h3 className="text-xl font-bold text-primary-900">Payment Schedule</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-background-50">
                    <tr>
                        {["BILLING DATE", "AMOUNT", "TRANSACTION ID", "STATUS"].map((h) => (
                            <th key={h} className="p-4 text-[10px] font-bold text-text-400 tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-background-50">
                    {payments?.length > 0 ? (
                        payments.map((row) => (
                            <tr key={row.id} className="hover:bg-background-50/50 transition-colors">
                                <td className="p-4 text-sm font-bold text-primary-900">
                                    {new Date(row.dueDate).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-sm font-bold text-primary-900">
                                    {row.amount} <span className="text-[10px] text-text-400">{row.stablecoin}</span>
                                </td>
                                <td className="p-4 text-xs font-mono text-text-400">
                                    {row.transactionHash ? `${row.transactionHash.slice(0, 8)}...${row.transactionHash.slice(-8)}` : "-- pending --"}
                                </td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                        row.status === 'COMPLETED' ? 'bg-secondary-500/10 text-secondary-500' : 
                                        row.status === 'OVERDUE' ? 'bg-destructive/10 text-destructive' :
                                        row.status === 'FAILED' ? 'bg-destructive/10 text-destructive opacity-50' :
                                        'bg-background-100 text-text-400'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-text-400 text-sm">No payment schedule found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);