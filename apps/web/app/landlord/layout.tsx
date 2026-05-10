import LandlordLayoutMain from "@/layouts/LandlordLayout";


export default function LandlordLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandlordLayoutMain>
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </LandlordLayoutMain>
        </>
    );
}
