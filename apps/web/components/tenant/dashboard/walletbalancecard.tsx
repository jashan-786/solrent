"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2, Plus, History, Wallet } from "lucide-react";

import { getAssociatedTokenAddress, getAccount, getMint } from "@solana/spl-token";
import { getStablecoinMint, getStablecoinDecimals } from "@repo/anchor";

export const BalanceCard = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const router = useRouter();
    const [solBalance, setSolBalance] = useState<number>(0);
    const [usdcBalance, setUsdcBalance] = useState<number>(0);
    const [isAirdropping, setIsAirdropping] = useState(false);
    const [airdropMsg, setAirdropMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const isMainnet = connection.rpcEndpoint?.toLowerCase().includes("mainnet");

    const fetchBalances = async () => {
        if (!publicKey) return;
        try {
            
            const sol = await connection.getBalance(publicKey);
            setSolBalance(sol / LAMPORTS_PER_SOL);

            const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: connection.rpcEndpoint });
            const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
            try {
                const tokenAccount = await connection.getTokenAccountBalance(ata);
                setUsdcBalance(tokenAccount.value.uiAmount || 0);
            } catch (e) {
                setUsdcBalance(0);
            }
        } catch (e) {
            
        }
    };

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);
    }, [publicKey, connection]);

    const handleAddFunds = async () => {
        if (!publicKey) return;

        if (isMainnet) {
            window.open(`https://jup.ag/swap/SOL-USDC?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, "_blank");
            return;
        }

        setIsAirdropping(true);
        setAirdropMsg(null);
        try {
            
            if (solBalance < 0.01) {
                try {
                    const sig = await connection.requestAirdrop(publicKey, 0.5 * LAMPORTS_PER_SOL);
                    await connection.confirmTransaction(sig, "confirmed");
                } catch (e) {
                    
                }
            }

            const response = await axios.post("/api/dev/faucet/usdc", { 
                amount: 5000,
                walletAddress: publicKey.toBase58() 
            });
            
            setAirdropMsg({ text: "5,000 Test USDC added to your account!", type: 'success' });
            fetchBalances();
            setTimeout(() => setAirdropMsg(null), 5000);
        } catch (e: any) {
            
            const msg = e.response?.data?.message || "Faucet unavailable. Please try again later.";
            setAirdropMsg({ text: msg, type: 'error' });
            setTimeout(() => setAirdropMsg(null), 4000);
        } finally {
            setIsAirdropping(false);
        }
    };

    return (
        <div className="bg-primary-950 text-white rounded-[32px] p-8 shadow-2xl h-full flex flex-col justify-between border border-primary-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary-500/20 transition-all duration-500" />
            
            <div className="flex items-center justify-between relative z-10">
                <p className="text-[10px] font-black tracking-[0.2em] text-secondary-400 uppercase">
                    {isMainnet ? "Solana Mainnet" : "Solana Devnet"}
                </p>
                {publicKey && (
                    <div className="flex items-center gap-1.5 bg-primary-900/50 px-2 py-1 rounded-lg border border-primary-800">
                        <Wallet className="h-3 w-3 text-secondary-400" />
                        <span className="text-[10px] font-mono text-text-400 font-bold">
                            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-6 mb-6 relative z-10 space-y-4">
                <div>
                    <p className="text-text-400 mb-1 text-[10px] font-black uppercase tracking-widest">SOL Balance</p>
                    <h3 className="font-black flex items-baseline gap-2 text-white text-2xl">
                        {publicKey ? solBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"} 
                        <span className="text-text-500 font-medium text-sm">SOL</span>
                    </h3>
                </div>
                <div>
                    <p className="text-text-400 mb-1 text-[10px] font-black uppercase tracking-widest">USDC Balance</p>
                    <h3 className="font-black flex items-baseline gap-2 text-secondary-400 text-2xl">
                        {publicKey ? usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} 
                        <span className="text-text-500 font-medium text-sm">USDC</span>
                    </h3>
                </div>
            </div>

            {airdropMsg && (
                <div className={`text-[10px] font-bold mb-4 p-3 rounded-xl border relative z-10 animate-in fade-in slide-in-from-bottom-2 ${
                    airdropMsg.type === 'error' 
                    ? "bg-destructive/10 border-destructive/20 text-destructive" 
                    : "bg-secondary-500/10 border-secondary-500/20 text-secondary-400"
                }`}>
                    {airdropMsg.text}
                </div>
            )}

            <div className="flex gap-3 relative z-10">
                <Button
                    onClick={handleAddFunds}
                    disabled={isAirdropping || !publicKey}
                    className="flex-1 bg-white text-primary-950 font-black rounded-xl h-12 hover:bg-background-50 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 border-none shadow-lg shadow-white/5"
                >
                    {isAirdropping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    {isAirdropping ? "Airdropping..." : "Add Funds"}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push("/tenant/payments")}
                    className="flex-1 border-primary-800 bg-primary-900/50 hover:bg-primary-800 text-white font-black rounded-xl h-12 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <History className="h-4 w-4" />
                    History
                </Button>
            </div>
        </div>
    );
};