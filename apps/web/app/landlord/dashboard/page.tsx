"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { LandlordStats } from "@/components/landlord/dashboard/landlordstats";
import { RevenueChart } from "@/components/landlord/dashboard/revenuecharts";
import { TransactionLedger } from "@/components/landlord/dashboard/ledger";
import { OccupancyTracker } from "@/components/landlord/dashboard/occupancytracker";
import { NotificationsModal } from "@/components/landlord/dashboard/notificationsmodal";
import { Bell, Wallet, ArrowUpRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { AddPropertyModal } from "@/components/modals/addpropertymodal";
import InviteTenantModal from "@/components/modals/invitetenant";
import AddLeaseModal from "@/components/modals/addlease";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { getStablecoinMint } from "@repo/anchor";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Dashboard() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const { data, isLoading, mutate: mutateDashboard } = useSWR("/api/landlord/dashboard", fetcher);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isAtaInitialized, setIsAtaInitialized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAta = async () => {
            if (!publicKey) return;
            try {
                const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: connection.rpcEndpoint });
                const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
                const info = await connection.getAccountInfo(ata);
                setIsAtaInitialized(!!info);
            } catch (e) {
                setIsAtaInitialized(false);
            }
        };
        checkAta();
    }, [publicKey, connection]);

    const handleInitializeWallet = async () => {
        if (!publicKey) return;
        setIsInitializing(true);
        try {
            const usdcMint = getStablecoinMint("USDC", { rpcEndpoint: connection.rpcEndpoint });
            const ata = await getAssociatedTokenAddress(usdcMint, publicKey);
            const info = await connection.getAccountInfo(ata);

            if (info) {
                alert("Your USDC account is already initialized!");
                setIsInitializing(false);
                return;
            }

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            const tx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    ata,
                    publicKey,
                    usdcMint
                )
            );
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            const sig = await sendTransaction(tx, connection);
            await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
            setIsAtaInitialized(true);
            alert("Wallet successfully initialized for USDC payments!");
        } catch (err) {

            alert("Failed to initialize wallet.");
        } finally {
            setIsInitializing(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const stats = data?.stats;
    const recentPayments = data?.recentPayments || [];
    const units = data?.units || [];

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-10 bg-background-50 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-primary-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-text-500 font-medium max-w-lg">
                        Monitoring property revenue, occupancy rates, and automated smart-contract settlements.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-12 px-6 gap-3 border-background-100 bg-white shadow-sm rounded-xl">
                        <Wallet size={18} className="text-secondary-500" />
                        <span className="font-mono text-sm text-primary-900 font-black">
                            {publicKey ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}` : "Not Connected"}
                        </span>
                    </Badge>
                    {publicKey && isAtaInitialized === false && (
                        <button
                            onClick={handleInitializeWallet}
                            disabled={isInitializing}
                            className="h-12 px-6 bg-sol-indigo hover:bg-sol-indigo/90 text-white font-bold rounded-xl shadow-lg shadow-sol-indigo/20 flex items-center gap-2 transition-all animate-in fade-in zoom-in duration-500"
                        >
                            {isInitializing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {isInitializing ? "Setting up..." : "Complete Setup"}
                        </button>
                    )}
                    {publicKey && isAtaInitialized === true && (
                        <div className="h-12 px-6 bg-sol-emerald/10 text-sol-emerald font-bold rounded-xl flex items-center gap-2 border border-sol-emerald/20 animate-in fade-in slide-in-from-right-4 duration-500">
                            <ShieldCheck size={18} />
                            Wallet Verified
                        </div>
                    )}
                </div>
            </header>

            <LandlordStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <RevenueChart revenueData={data?.revenueData} />
                    <TransactionLedger payments={recentPayments} />
                </div>

                <div className="lg:col-span-4 space-y-8">

                    <Card className="bg-white border-none shadow-sm rounded-[32px] p-2">
                        <CardHeader className="p-6 pb-2">
                            <h4 className="text-primary-900 uppercase tracking-widest text-[10px] font-black">Management Hub</h4>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-2 p-4">
                            <InviteTenantModal isVerified={isAtaInitialized === true} />
                            <AddPropertyModal />
                            <AddLeaseModal isVerified={isAtaInitialized === true} />
                        </CardContent>
                    </Card>


                    {data?.pendingTenants?.length > 0 && (
                        <Card className="bg-white border border-secondary-100 shadow-sm rounded-[32px] overflow-hidden">
                            <CardHeader className="p-6 pb-2 bg-secondary-50/30 flex flex-row items-center justify-between">
                                <h4 className="text-secondary-600 uppercase tracking-widest text-[10px] font-black">Needs Lease</h4>
                                <Badge className="bg-secondary-500 text-white border-none">{data.pendingTenants.length}</Badge>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {data.pendingTenants.map((t: any) => (
                                    <div key={t.id} className="p-4 rounded-2xl bg-white border border-background-100 flex flex-col gap-3">
                                        <div>
                                            <p className="text-sm font-black text-primary-900">{t.name}</p>
                                            <p className="text-[10px] font-bold text-text-400 uppercase tracking-tight">{t.building}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <AddLeaseModal />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-primary-950 border-none shadow-2xl text-white rounded-[32px] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                            <h3 className="text-white text-xl font-bold">Recent Notifications</h3>
                            <Badge className="bg-secondary-500 text-white border-none font-bold px-3">NEW</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 p-8 pt-4">
                            {data?.notifications?.length > 0 ? data.notifications.map((n: any) => (
                                <div key={n.id} className="p-5 rounded-2xl bg-primary-900/50 border border-primary-800 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                                            {n.type}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium">
                                        {n.message}
                                    </p>
                                </div>
                            )) : (
                                <div className="p-5 rounded-2xl bg-primary-900/50 border border-primary-800 text-center text-sm text-slate-400">
                                    No new notifications.
                                </div>
                            )}
                            <button
                                onClick={() => setIsNotificationsOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-secondary-400 hover:text-white transition-all hover:gap-3"
                            >
                                View All Notifications <ArrowUpRight size={16} />
                            </button>
                        </CardContent>
                    </Card>

                    <OccupancyTracker units={units} />

                    <Card className="bg-white border border-background-100 shadow-sm rounded-[32px] p-2">
                        <CardHeader className="p-6 pb-2">
                            <h4 className="text-primary-900 uppercase tracking-widest text-[10px] font-black">Wallet Activity</h4>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-background-50 text-primary-900">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-primary-900">System Verified</p>
                                    <p className="text-xs text-text-400 font-medium">Dashboard connected to Solana Devnet</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>
    );
}