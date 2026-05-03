"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import { Wallet, User, Building2 } from "lucide-react";

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("TENANT");

    const handleLogin = async () => {
        setIsLoading(true);
        // Add SIWS logic here. The API returns user.role, so in reality, we don't need tabs here!
        // But for mock UI purposes, we use tabs to determine the redirect.
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard";
        }, 2000);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-none">
            <CardHeader className="space-y-2 text-center pb-4">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary-900">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-text-500 text-base">
                    Sign in to your Solrent account using your Solana wallet.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <Tabs defaultValue="TENANT" onValueChange={setRole} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="TENANT" className="flex items-center gap-2">
                            <User size={16} /> Tenant
                        </TabsTrigger>
                        <TabsTrigger value="LANDLORD" className="flex items-center gap-2">
                            <Building2 size={16} /> Landlord
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-col gap-4">
                    <Button 
                        onClick={handleLogin} 
                        disabled={isLoading}
                        className="w-full py-6 text-base font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Connecting to Wallet...</span>
                        ) : (
                            <>
                                <Wallet size={20} />
                                Connect Wallet to Sign In
                            </>
                        )}
                    </Button>
                </div>
                <div className="text-center text-sm text-text-500 pt-4 border-t border-background-200">
                    Don't have an account? <a href="/register" className="text-accent-600 font-bold hover:underline">Sign up</a>
                </div>
            </CardContent>
        </Card>
    );
};
