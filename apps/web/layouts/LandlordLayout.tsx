import LandlordSidebar from "@repo/ui/components/landlordsidebar";

export default function LandlordLayoutMain({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="flex flex-row">
                <LandlordSidebar />
                <div className="flex-1 p-2 ml-16 md:ml-64 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </>
    );
}