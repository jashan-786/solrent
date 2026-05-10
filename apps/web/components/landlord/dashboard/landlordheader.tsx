export default function LandlordHeader() {
    return (
        <div className="mb-8">
            <div className="inline-block relative">
                <h1 className="text-5xl font-bold text-brand-navy tracking-tight mb-2">
                    Portfolio Hub
                </h1>
                
                <div className="absolute bottom-1 left-0 w-full h-[3px] bg-solrent-emerald rounded-full" />
            </div>

            <p className="text-lg text-text-muted mt-4 font-medium">
                Real-time performance analytics for your Solana real estate assets.
            </p>
        </div>
    );
};