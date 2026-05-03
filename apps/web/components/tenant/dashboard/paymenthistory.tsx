import { Button } from "@repo/ui/components/ui/button";
import { FileText, XCircle } from "lucide-react";

const ListItem = ({ title, sub, val, status, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl mb-2 border border-transparent hover:border-background-100 transition-all shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'COMPLETED' ? 'bg-secondary-50 text-secondary-500' : 'bg-destructive/10 text-destructive'}`}>
                {status === 'COMPLETED' ? <FileText size={20} /> : <XCircle size={20} />}
            </div>
            <div>
                <p className="text-sm font-bold text-primary-900">{title}</p>
                <p className="text-[10px] text-text-500 font-medium">{sub}</p>
            </div>
        </div>
        <p className={`font-bold ${status === 'COMPLETED' ? "text-secondary-500" : "text-destructive"}`}>
            {status === 'COMPLETED' ? `-${val}` : `FAILED`}
        </p>
    </div>
);

export default function PaymentHistory({ payments }: { payments: any[] }) {
    return (
        <div className="flex flex-col gap-2 w-full ">
            <div className="flex flex-row justify-between items-center w-full mb-2">
                <h2 className="text-lg font-bold text-primary-900">Payment History</h2>
                <Button variant={"link"} className="text-secondary-500">View All</Button>
            </div>
            {!payments || payments.length === 0 ? (
                <div className="p-8 text-center text-text-400 text-sm bg-white rounded-2xl shadow-sm italic">
                    No payment history available.
                </div>
            ) : (
                payments.map((p) => (
                    <ListItem 
                        key={p.id}
                        title={`Rent Payment - ${new Date(p.dueDate).toLocaleString('default', { month: 'long' })}`} 
                        sub={new Date(p.paidAt || p.dueDate).toLocaleDateString()} 
                        val={`${p.amount} ${p.stablecoin}`} 
                        status={p.status}
                    />
                ))
            )}
        </div>
    );
}