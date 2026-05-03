"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@repo/ui/components/ui/button";

export const BalanceCard = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        if (!publicKey) return;

        const fetchBalance = async () => {
            try {
                const bal = await connection.getBalance(publicKey);
                setBalance(bal / LAMPORTS_PER_SOL);
            } catch (e) {
                console.error("Failed to fetch balance", e);
            }
        };

        fetchBalance();
        const id = connection.onAccountChange(publicKey, (acc) => {
            setBalance(acc.lamports / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id);
        };
    }, [publicKey, connection]);

    return (
        <div className="bg-primary-950 text-white rounded-[12px] p-8 shadow-lg h-full flex flex-col justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] text-text-400 uppercase">Solana Devnet</p>
            <div className="mt-4 mb-8">
                <p className="text-text-400 mb-1 text-sm">Available Balance</p>
                <h3 className="font-bold flex items-baseline gap-2 text-white">
                    {publicKey ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} 
                    <span className="text-text-400 font-medium text-xl">SOL</span>
                </h3>
            </div>
            <div className="flex gap-3">
                <Button className="flex-1 bg-white text-text-950 font-bold rounded-lg h-12 hover:bg-background-100 transition-colors">
                    Add Funds
                </Button>
                <Button variant="outline" className="flex-1 border-primary-700 bg-primary-800/50 hover:bg-primary-700 text-white font-bold rounded-lg h-12">
                    History
                </Button>
            </div>
        </div>
    );
};