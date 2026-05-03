"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { checkSession } = useAuth();

    useEffect(() => {
        // Only run on client mount
        checkSession();
    }, []);

    return <>{children}</>;
};
