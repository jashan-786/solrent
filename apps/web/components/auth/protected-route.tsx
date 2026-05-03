"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";

export const ProtectedRoute = ({
    children,
    role
}: {
    children: React.ReactNode,
    role?: "LANDLORD" | "TENANT"
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (role && user?.role !== role) {
                router.push(user?.role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard");
            }
        }
    }, [mounted, isLoading, isAuthenticated, role, user, router]);
    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || (role && user?.role !== role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-50">
                <p className="text-text-500 font-medium animate-pulse">Redirecting...</p>
            </div>
        );
    }

    return <>{children}</>;
};
