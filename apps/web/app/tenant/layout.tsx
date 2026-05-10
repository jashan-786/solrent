import TenantLayoutMain from "@/layouts/TenantLayout";


export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TenantLayoutMain>
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </TenantLayoutMain>
        </>
    );
}
