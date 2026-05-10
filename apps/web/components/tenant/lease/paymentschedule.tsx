export const PaymentSchedule = () => (
    <div className="bg-white rounded-twelve shadow-sm border border-gray-100 overflow-hidden rounded-[12px]">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-brand-navy">Payment Schedule</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-secondary">
                    <tr>
                        {["BILLING DATE", "AMOUNT", "TRANSACTION ID", "STATUS"].map((h) => (
                            <th key={h} className="p-4 text-[10px] font-bold text-text-muted tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {[
                        { date: "Apr 01, 2024", amt: "2,450.00", tx: "-- pending --", status: "UPCOMING" },
                        { date: "Mar 01, 2024", amt: "2,450.00", tx: "sol_tx_8291...4a2b", status: "PAID" },
                    ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-sm font-bold text-brand-navy">{row.date}</td>
                            <td className="p-4 text-sm font-bold text-brand-navy">{row.amt} <span className="text-[10px] text-text-muted">USDC</span></td>
                            <td className="p-4 text-xs font-mono text-text-muted">{row.tx}</td>
                            <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${row.status === 'PAID' ? 'bg-solrent-surface text-solrent-emerald' : 'bg-gray-100 text-text-muted'
                                    }`}>
                                    {row.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);