import { Building } from "@repo/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { ArrowLeft, MapPin, Users, Wallet, TrendingUp, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddUnitModal } from "@/components/modals/addunitmodal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";

import { useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { AnchorProvider, BN, Program, Idl } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../../../../../packages/anchor/idl/contract_solrent.json";
import {
    getLeasePDA,
    getDelegatePDA,
    getMetadataPDA,
    getMasterEditionPDA,
    METAPLEX_PROGRAM_ID,
    getStablecoinMint,
    getStablecoinDecimals
} from "@repo/anchor";
import axios from "axios";
import { mutate } from "swr";

export default function BuildingDetailsPage({ building }: { building: Building }) {
    const router = useRouter();
    const { user } = useAuth();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { connection } = useConnection();
    const [isCollecting, setIsCollecting] = useState(false);
    const [collectionProgress, setCollectionProgress] = useState("");

    const handleCollectRent = async () => {
        if (!publicKey || !wallet?.adapter) {
            alert("Please connect your wallet first");
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const activeLeases = (building as any).units_list
            ?.flatMap((u: any) => u.leases || [])
            .filter((l: any) => {
                const dueTime = l.nextDueTimestamp ? Number(l.nextDueTimestamp) : (l.startDate ? Math.floor(new Date(l.startDate).getTime() / 1000) : null);
                const isDue = dueTime !== null ? dueTime <= now : false;
                return l.status === "ACTIVE" && l.tenant?.walletAddress && isDue;
            });

        if (!activeLeases || activeLeases.length === 0) {
            alert("No active leases with connected wallets found to collect from.");
            return;
        }

        setIsCollecting(true);
        setCollectionProgress(`Starting collection for ${activeLeases.length} leases...`);

        try {
            const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: "confirmed" });
            const program = new Program(idl as Idl, provider) as any;

            for (let i = 0; i < activeLeases.length; i++) {
                const lease = activeLeases[i];
                setCollectionProgress(`Collecting from ${lease.tenant.name} (${i + 1}/${activeLeases.length})...`);

                try {
                    const tenantPubkey = new PublicKey(lease.tenant.walletAddress);
                    const onChainId = BigInt(lease.onChainId || 0);
                    const [leasePDA] = getLeasePDA(publicKey, tenantPubkey, onChainId);
                    const [delegatePDA] = getDelegatePDA(leasePDA, onChainId);

                    const STABLECOIN_MINT = getStablecoinMint(lease.stablecoin, { rpcEndpoint: connection.rpcEndpoint });
                    const tenantAta = await getAssociatedTokenAddress(STABLECOIN_MINT, tenantPubkey);
                    const landlordAta = await getAssociatedTokenAddress(STABLECOIN_MINT, publicKey);

                    const nftMint = Keypair.generate();
                    const nftTokenAccount = await getAssociatedTokenAddress(nftMint.publicKey, tenantPubkey);
                    const [metadataPDA] = getMetadataPDA(nftMint.publicKey);
                    const [masterEditionPDA] = getMasterEditionPDA(nftMint.publicKey);

                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

                    const tx = new Transaction();

                    const landlordAtaInfo = await connection.getAccountInfo(landlordAta);
                    if (!landlordAtaInfo) {
                        tx.add(
                            createAssociatedTokenAccountInstruction(
                                publicKey,
                                landlordAta,
                                publicKey,
                                STABLECOIN_MINT
                            )
                        );
                    }

                    const decimals = getStablecoinDecimals(lease.stablecoin);
                    const amountInBaseUnits = new BN(lease.monthlyRent).mul(new BN(10).pow(new BN(decimals)));
                    const executePaymentIx = await program.methods
                        .executePayment(new BN(onChainId.toString()), amountInBaseUnits)
                        .accounts({
                            payer: publicKey,
                            landlord: publicKey,
                            tenant: tenantPubkey,
                            landlordAta: landlordAta,
                            tenantAta: tenantAta,
                            lease: leasePDA,
                            delegate: delegatePDA,
                            mint: nftMint.publicKey,
                            nftTokenAccount: nftTokenAccount,
                            metadata: metadataPDA,
                            masterEdition: masterEditionPDA,
                            tokenMetadataProgram: METAPLEX_PROGRAM_ID,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                            systemProgram: SystemProgram.programId,
                            rent: SYSVAR_RENT_PUBKEY,
                        } as any)
                        .instruction();

                    tx.add(executePaymentIx);

                    tx.recentBlockhash = blockhash;
                    tx.feePayer = publicKey;

                    const sig = await sendTransaction(tx, connection, { signers: [nftMint] });
                    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

                    await axios.post("/api/landlord/payments/sync", {
                        leaseId: lease.id,
                        transactionHash: sig,
                        amount: lease.monthlyRent,
                        status: "COMPLETED",
                        nftMint: nftMint.publicKey.toBase58()
                    });

                } catch (err: any) {
                    let friendlyError = err.message;
                    if (err.message?.includes("LeaseNotActive") || err.message?.includes("6001")) {
                        friendlyError = "Tenant has not enabled Auto-Pay yet.";
                    } else if (err.message?.includes("insufficient funds")) {
                        friendlyError = "Tenant has insufficient funds.";
                    }
                    
                    setCollectionProgress(`Failed for ${lease.tenant.name}: ${friendlyError}`);

                    try {
                        await axios.post("/api/landlord/payments/sync", {
                            leaseId: lease.id,
                            amount: lease.monthlyRent,
                            status: "FAILED",
                            error: friendlyError
                        });
                    } catch (syncErr) {
                        // Ignore sync error
                    }
                    
                    // Wait a moment so the user can read the error before moving to next
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            setCollectionProgress("Collection complete!");
            mutate(`/api/landlord/building/${building.id}`); 
            mutate("/api/landlord/dashboard");
            setTimeout(() => {
                setIsCollecting(false);
                setCollectionProgress("");
            }, 3000);

        } catch (error: any) {
            
            alert("Error during rent collection.");
            setIsCollecting(false);
            setCollectionProgress("");
        }
    };

    const handleViewWallet = () => {
        if (user?.walletAddress) {
            alert(`Building Wallet Address: ${user.walletAddress}`);
        } else {
            alert("No wallet connected.");
        }
    };
    return (
        <div className="min-h-screen bg-surface-primary p-6 lg:p-10">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    onClick={() => router.back()}
                    variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-auth-navy flex items-center gap-3">
                        {building.name}
                        <Badge className="bg-sol-emerald/10 text-sol-emerald border-none">Active Asset</Badge>
                    </h2>
                    <p className="text-text-grey text-sm flex items-center gap-1">
                        <MapPin size={14} /> {building.address}, {building.city}, {building.country}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <div className="relative h-64 md:h-96 w-full">
                            <img
                                src={building.img || "/placeholder-building.jpg"}
                                alt={building.name}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg">
                                <p className="text-tiny font-bold text-text-grey uppercase">On-Chain ID</p>
                                <p className="font-mono text-xs text-sol-indigo">{building.id}</p>
                            </div>
                        </div>
                    </Card>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-transparent rounded-none w-full justify-start gap-8 h-12 p-0 border-b border-background-200">
                            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-none bg-transparent px-0 font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="units" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-none bg-transparent px-0 font-bold">Units</TabsTrigger>
                            <TabsTrigger value="tenants" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-none bg-transparent px-0 font-bold">Tenants</TabsTrigger>
                        </TabsList>

                        <TabsContent value="units" className="pt-6">
                            <Card className="p-6 border-none bg-white shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h6 className="text-auth-navy font-bold">Building Units</h6>
                                    <AddUnitModal buildingId={building.id} />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-background-100">
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Unit</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Tenant</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Rent</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Type</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400 text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(building as any).units_list?.length > 0 ? (
                                            (building as any).units_list.map((unit: any) => (
                                                <TableRow key={unit.id} className="border-background-50 hover:bg-background-50/50">
                                                    <TableCell className="font-bold text-primary-900">{unit.unitNumber}</TableCell>
                                                    <TableCell className="text-text-600 font-medium">
                                                        {unit.leases && unit.leases.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-sol-indigo text-white flex items-center justify-center text-[10px] font-bold">
                                                                    {unit.leases[0].tenant?.name?.charAt(0) || "U"}
                                                                </div>
                                                                <span>{unit.leases[0].tenant?.name || "Unknown"}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-text-400 italic">No tenant</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-text-600 font-medium">${unit.rentAmount}</TableCell>
                                                    <TableCell className="text-text-500 text-xs">{unit.bedrooms}B / {unit.bathrooms}B</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge className={unit.occupied ? "bg-sol-emerald/10 text-sol-emerald" : "bg-secondary-500/10 text-secondary-500"}>
                                                            {unit.occupied ? "Occupied" : "Vacant"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-text-400">
                                                    No units registered yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tenants" className="pt-6">
                            <Card className="p-6 border-none bg-white shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h6 className="text-auth-navy font-bold">Active Tenants</h6>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(building as any).units_list?.filter((u: any) => u.leases && u.leases.length > 0).length > 0 ? (
                                        (building as any).units_list.filter((u: any) => u.leases && u.leases.length > 0).map((unit: any) => (
                                            <div key={`tenant-${unit.id}`} className="flex items-center gap-4 p-4 rounded-xl border border-background-100 bg-background-50/50">
                                                <div className="w-12 h-12 rounded-full bg-sol-indigo text-white flex items-center justify-center text-lg font-bold">
                                                    {unit.leases[0].tenant?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary-900">{unit.leases[0].tenant?.name || "Unknown Tenant"}</h4>
                                                    <p className="text-xs text-text-500 font-medium">{unit.leases[0].tenant?.email || "No email provided"}</p>
                                                    <Badge className="mt-2 bg-sol-emerald/10 text-sol-emerald border-none text-[10px]">
                                                        Unit {unit.unitNumber}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center py-10 bg-background-50 rounded-xl border border-dashed border-background-200">
                                            <Users className="mx-auto h-8 w-8 text-text-300 mb-2" />
                                            <h3 className="text-text-500 font-bold">No active tenants</h3>
                                            <p className="text-xs text-text-400 mt-1">There are currently no active leases in this building.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="overview" className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-6 border-none bg-white">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} /> Revenue Performance
                                    </h6>
                                    <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center text-text-grey text-xs">
                                        [Chart: Monthly Yield Trends]
                                    </div>
                                </Card>
                                <Card className="p-6 border-none bg-white">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <History size={16} /> Asset Details
                                    </h6>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Total Units</span>
                                            <span className="font-bold text-auth-navy">{building.units}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Current Occupancy</span>
                                            <span className="font-bold text-sol-emerald">{building.occupied} / {building.units}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm text-text-grey">Country</span>
                                            <span className="font-bold text-auth-navy">{building.country}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-auth-navy text-white border-none shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-tiny font-bold opacity-60 uppercase">Projected Yield</p>
                                <h2 className="text-2xl text-white">
                                    ${building.monthlyyield ? building.monthlyyield.toLocaleString() : "0"}
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-tiny font-bold text-sol-emerald uppercase">Available Now</p>
                                <h2 className="text-2xl text-sol-emerald">
                                    ${(() => {
                                        const now = Math.floor(Date.now() / 1000);
                                        const collectable = (building as any).units_list
                                            ?.flatMap((u: any) => u.leases || [])
                                            .filter((l: any) => {
                                                const dueTime = l.nextDueTimestamp ? Number(l.nextDueTimestamp) : (l.startDate ? Math.floor(new Date(l.startDate).getTime() / 1000) : null);
                                                const isDue = dueTime !== null ? dueTime <= now : false;
                                                return l.status === "ACTIVE" && l.tenant?.walletAddress && isDue;
                                            })
                                            .reduce((sum: number, l: any) => sum + (l.monthlyRent || 0), 0);
                                        return collectable ? collectable.toLocaleString() : "0";
                                    })()}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3 mt-6">
                            <Button
                                onClick={handleCollectRent}
                                disabled={isCollecting}
                                className="w-full bg-sol-emerald hover:bg-sol-emerald/90 text-white font-bold h-12"
                            >
                                {isCollecting ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span>Collecting...</span>
                                        <p className="text-[10px] opacity-70 font-medium">{collectionProgress}</p>
                                    </div>
                                ) : (
                                    "Collect All Rent"
                                )}
                            </Button>
                            <Button
                                onClick={handleViewWallet}
                                variant="outline"
                                className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white h-12"
                            >
                                View Wallet Address
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-none shadow-sm">
                        <h6 className="text-auth-navy font-bold mb-4">Quick Stats</h6>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-surface-secondary rounded-lg text-center">
                                <Users size={16} className="mx-auto mb-1 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase">Retention</p>
                                <p className="font-bold text-auth-navy">92%</p>
                            </div>
                            <div className="p-3 bg-surface-secondary rounded-lg text-center">
                                <Wallet size={16} className="mx-auto mb-1 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase">Avg Rent</p>
                                <p className="font-bold text-auth-navy">$2.1k</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
