"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";

export default function LandlordLogoutPage() {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, [logout]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent"></div>
                <p className="text-text-600 font-medium italic">Logging you out safely...</p>
            </div>
        </div>
    );
}
