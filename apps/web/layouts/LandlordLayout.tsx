import LandlordSidebar from "@repo/ui/components/landlordsidebar";

export default function LandlordLayoutMain({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="flex flex-row">
                <LandlordSidebar />
                <div className="flex-1 p-2">
                    {children}
                </div>
            </div>
        </>
    );
}