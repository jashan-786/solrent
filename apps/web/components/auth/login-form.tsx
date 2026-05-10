"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Wallet, User, Building2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/store/useAuth";
import axios from "axios";
import bs58 from "bs58";

export const LoginForm = () => {
    const { publicKey, signMessage, connected, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const { setUser } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!connected || !publicKey || !signMessage) {
            setVisible(true);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const messageText = `Sign this message to authenticate with Solrent.\n\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`;
            const messageEncoded = new TextEncoder().encode(messageText);

            const signature = await signMessage(messageEncoded);
            const signatureArray = Array.from(signature);

            const res = await axios.post("/api/auth/login", {
                walletAddress: publicKey.toBase58(),
                signature: signatureArray,
                message: messageText
            });

            if (res.data.success) {
                setUser(res.data.user);
                
                window.location.href = res.data.user.role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard";
            }
        } catch (err: any) {
            
            setError(err.response?.data?.error || err.response?.data?.message || "Authentication failed. Make sure you have an account.");
        } finally {
            setIsLoading(false);
        }
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
                
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <Button 
                        onClick={handleLogin} 
                        disabled={isLoading}
                        className="w-full py-6 text-base font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Awaiting Signature...</span>
                        ) : (
                            <>
                                <Wallet size={20} />
                                {connected ? "Sign Message to Login" : "Connect Wallet to Sign In"}
                            </>
                        )}
                    </Button>

                    {connected && publicKey && (
                        <button 
                            onClick={() => disconnect()} 
                            className="text-xs text-text-400 hover:text-text-600 underline"
                        >
                            Disconnect {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                        </button>
                    )}
                </div>
                <div className="text-center text-sm text-text-500 pt-4 border-t border-background-200">
                    Don't have an account? <a href="/register" className="text-accent-600 font-bold hover:underline">Sign up</a>
                </div>
            </CardContent>
        </Card>
    );
};
