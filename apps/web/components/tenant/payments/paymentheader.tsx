export default function PaymentHeader() {
    return (
        <div className="mb-10">
            <div className="inline-block relative">
                <h1 className="text-5xl font-bold text-brand-navy tracking-tight mb-2">
                    Financial Ledger
                </h1>
                <div className="mt-4 absolute bottom-1 left-0 w-full h-[3px] bg-blue-500 rounded-full" />
            </div>

            <p className="text-lg text-text-muted mt-4 font-medium">
                Monitoring property revenue and smart-contract settlements.
            </p>
        </div>
    );
};