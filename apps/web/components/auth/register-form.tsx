"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Wallet, Key, User, Building2 } from "lucide-react";

export const RegisterForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("TENANT");
    
    const handleNext = () => {
        setStep(2);
    }

    const handleRegister = async () => {
        setIsLoading(true);
        // Add SIWS + Register logic here
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard";
        }, 2000);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-none">
            <CardHeader className="space-y-2 text-center pb-4">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary-900">
                    Create an Account
                </CardTitle>
                <CardDescription className="text-text-500 text-base">
                    Join Solrent to manage your properties or sign leases with ease.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {step === 1 ? (
                    <div className="space-y-5">
                        
                        <Tabs defaultValue="TENANT" onValueChange={setRole} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="TENANT" className="flex items-center gap-2">
                                    <User size={16} /> Tenant
                                </TabsTrigger>
                                <TabsTrigger value="LANDLORD" className="flex items-center gap-2">
                                    <Building2 size={16} /> Landlord
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="name" className="text-text-700 font-bold">Full Name</Label>
                            <Input id="name" placeholder="John Doe" className="bg-background-50 border-background-200" />
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-text-700 font-bold">Email Address</Label>
                            <Input id="email" type="email" placeholder="john@example.com" className="bg-background-50 border-background-200" />
                        </div>
                        
                        {role === "TENANT" && (
                            <div className="space-y-2 text-left animate-in fade-in zoom-in duration-300">
                                <Label htmlFor="code" className="flex items-center gap-2 text-text-700 font-bold">
                                    <Key size={14} className="text-accent-500" />
                                    Invite Code (Required for Tenants)
                                </Label>
                                <Input id="code" placeholder="ENTER-CODE-HERE" className="bg-background-50 border-background-200 uppercase" />
                            </div>
                        )}

                        <Button 
                            onClick={handleNext}
                            className="w-full py-6 text-base font-bold bg-primary-600 hover:bg-primary-700 text-white mt-6"
                        >
                            Continue
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 mb-2">
                            <p className="text-sm text-secondary-800 text-center font-medium">
                                Almost done! Link your Solana wallet to cryptographically secure your account.
                            </p>
                        </div>
                        <Button 
                            onClick={handleRegister} 
                            disabled={isLoading}
                            className="w-full py-6 text-base font-bold bg-secondary-500 hover:bg-secondary-600 text-white flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Awaiting Signature...</span>
                            ) : (
                                <>
                                    <Wallet size={20} />
                                    Sign Message & Register
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-text-500 hover:bg-background-100">
                            Back
                        </Button>
                    </div>
                )}
                
                <div className="text-center text-sm text-text-500 pt-6 mt-6 border-t border-background-200">
                    Already have an account? <a href="/login" className="text-accent-600 font-bold hover:underline">Sign in</a>
                </div>
            </CardContent>
        </Card>
    );
};
