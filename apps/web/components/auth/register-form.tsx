"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Wallet, Key, User, Building2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/store/useAuth";
import axios from "axios";

export const RegisterForm = () => {
    const { publicKey, signMessage, connected } = useWallet();
    const { setVisible } = useWalletModal();
    const { setUser } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("TENANT");
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        code: ""
    });

    const handleNext = () => {
        if (!formData.name || !formData.email) {
            setError("Name and Email are required");
            return;
        }
        if (role === "TENANT" && !formData.code) {
            setError("Invite code is required for tenants");
            return;
        }
        setError(null);
        setStep(2);
    }

    const handleRegister = async () => {
        if (!connected || !publicKey || !signMessage) {
            setVisible(true);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const messageText = `Sign this message to register with Solrent.\n\nRole: ${role}\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}${role === "TENANT" ? `\nInvite Code: ${formData.code}` : ""}`;
            const messageEncoded = new TextEncoder().encode(messageText);

            const signature = await signMessage(messageEncoded);
            const signatureArray = Array.from(signature);

            const endpoint = role === "LANDLORD" ? "/api/auth/register-landlord" : "/api/auth/register";
            const res = await axios.post(endpoint, {
                ...formData,
                walletAddress: publicKey.toBase58(),
                signature: signatureArray,
                message: messageText
            });

            if (res.data.success) {
                setUser(res.data.user);
                window.location.href = role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard";
            }
        } catch (err: any) {
            
            setError(err.response?.data?.message || "Registration failed. Check your invite code.");
        } finally {
            setIsLoading(false);
        }
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
                
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-5">
                        <Tabs defaultValue="TENANT" onValueChange={(v) => setRole(v)} className="w-full">
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
                            <Input 
                                id="name" 
                                placeholder="John Doe" 
                                className="bg-background-50 border-background-200" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-text-700 font-bold">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="john@example.com" 
                                className="bg-background-50 border-background-200" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        
                        {role === "TENANT" && (
                            <div className="space-y-2 text-left animate-in fade-in zoom-in duration-300">
                                <Label htmlFor="code" className="flex items-center gap-2 text-text-700 font-bold">
                                    <Key size={14} className="text-accent-500" />
                                    Invite Code (Required for Tenants)
                                </Label>
                                <Input 
                                    id="code" 
                                    placeholder="ENTER-CODE-HERE" 
                                    className="bg-background-50 border-background-200 uppercase" 
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                />
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
                        <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 mb-2 text-center">
                            <p className="text-sm text-secondary-800 font-medium">
                                {connected ? "Wallet Connected!" : "Link your Solana wallet to complete registration."}
                            </p>
                            {connected && (
                                <p className="text-[10px] text-secondary-600 font-mono mt-1">
                                    {publicKey?.toBase58()}
                                </p>
                            )}
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
                                    {connected ? "Sign Message & Register" : "Connect Wallet"}
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-text-500 hover:bg-background-100" disabled={isLoading}>
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
