"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider = ({ children }: { children: React.ReactNode }) => {

    const network = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta"
        ? WalletAdapterNetwork.Mainnet
        : process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "testnet"
            ? WalletAdapterNetwork.Testnet
            : WalletAdapterNetwork.Devnet);

    const endpoint = useMemo(() => {
        
        const devnet = process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL;
        const mainnet = process.env.NEXT_PUBLIC_HELIUS_MAINNET_RPC_URL;

        if (network === WalletAdapterNetwork.Mainnet && mainnet) return mainnet;
        if (network === WalletAdapterNetwork.Devnet && devnet) return devnet;

        if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

        return clusterApiUrl(network);
    }, [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect onError={(error) => {
                if (error.message?.toLowerCase().includes("user rejected") || 
                    error.name === "WalletSendTransactionError" ||
                    error.toString().toLowerCase().includes("rejected")) {
                    
                    return;
                }
                
            }}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
