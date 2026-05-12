import { Building } from "@repo/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useRouter } from "next/navigation";
import { AddUnitModal } from "@/components/modals/addunitmodal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ArrowLeft, MapPin, Users, Wallet, TrendingUp, History, MoreHorizontal, Copy } from "lucide-react";

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
        const activeLeases = building.units_list
            ?.flatMap((u: any) => u.leases || [])
            .filter((l: any) => {
                const dueTime = l.nextDueTimestamp ? Number(l.nextDueTimestamp) : (l.startDate ? Math.floor(new Date(l.startDate).getTime() / 1000) : null);
                const isDue = dueTime !== null ? dueTime <= now : false;
                return l.status === "ACTIVE" && l.tenant?.walletAddress && isDue && l.autoPayEnabled === true;
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
                    const confirmation = await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

                    if (confirmation.value.err) {
                        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
                    }

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
                            <TabsTrigger value="invites" className="data-[state=active]:border-b-2 data-[state=active]:border-sol-indigo rounded-none bg-transparent px-0 font-bold">Invites</TabsTrigger>
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
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Invite Code</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Rent</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Type</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Status</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400 text-right pr-6">...</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {building.units_list && building.units_list.length > 0 ? (
                                            building.units_list.map((unit: any) => (
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
                                                    <TableCell>
                                                        {unit.inviteCodes && unit.inviteCodes.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-1 rounded border font-mono text-[10px] font-black ${unit.inviteCodes[0].isUsed ? 'bg-slate-50 text-slate-400 border-slate-100 line-through' : 'bg-secondary-50 text-secondary-600 border-secondary-100'}`}>
                                                                    {unit.inviteCodes[0].code}
                                                                </span>
                                                                {!unit.inviteCodes[0].isUsed && (
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(unit.inviteCodes[0].code);
                                                                            alert("Code copied!");
                                                                        }}
                                                                        className="text-secondary-400 hover:text-secondary-600 p-1 hover:bg-secondary-50 rounded"
                                                                    >
                                                                        <Copy size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-7 text-[10px] text-secondary-500 hover:text-secondary-600 hover:bg-secondary-50 font-bold"
                                                                onClick={async () => {
                                                                    try {
                                                                        await axios.post("/api/landlord/invite-codes", {
                                                                            buildingId: building.id,
                                                                            unitId: unit.id
                                                                        });
                                                                        mutate(`/api/landlord/building/${building.id}`);
                                                                    } catch (err) {
                                                                        alert("Failed to generate code");
                                                                    }
                                                                }}
                                                            >
                                                                Generate Code
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-text-600 font-medium">{unit.rentAmount} USDC</TableCell>
                                                    <TableCell className="text-text-500 text-xs">{unit.bedrooms}B / {unit.bathrooms}B</TableCell>
                                                    <TableCell>
                                                        {unit.leases && unit.leases.length > 0 ? (
                                                            unit.leases[0].status === "ACTIVE" ? (
                                                                <Badge className="bg-sol-emerald/10 text-sol-emerald">Occupied</Badge>
                                                            ) : (
                                                                <Badge className="bg-amber-500/10 text-amber-600">Pending Acceptance</Badge>
                                                            )
                                                        ) : (
                                                            <Badge className="bg-secondary-500/10 text-secondary-500">Vacant</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-text-400">Unit Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => router.push('/landlord/leases')}
                                                                    className="gap-2 font-bold cursor-pointer"
                                                                >
                                                                    View Active Lease
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => alert("Edit unit feature coming soon")}
                                                                    className="gap-2 font-bold cursor-pointer"
                                                                >
                                                                    Edit Unit Details
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-text-400">
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
                                    {building.units_list?.filter((u: any) => u.leases && u.leases.length > 0).length ? (
                                        building.units_list.filter((u: any) => u.leases && u.leases.length > 0).map((unit: any) => (
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

                        <TabsContent value="invites" className="pt-6">
                            <Card className="p-6 border-none bg-white shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h6 className="text-auth-navy font-bold">Invitation Management</h6>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-text-400">Building-wide & Unit Specific</Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-background-100">
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Code</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Assignment</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400">Created</TableHead>
                                            <TableHead className="text-tiny font-bold uppercase text-text-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {building.inviteCodes && building.inviteCodes.length > 0 ? (
                                            building.inviteCodes.map((invite: any) => (
                                                <TableRow key={invite.id} className="border-background-50">
                                                    <TableCell className="font-mono font-black text-sol-indigo">{invite.code}</TableCell>
                                                    <TableCell className="text-xs font-bold text-auth-navy">
                                                        {invite.unitId ? (
                                                            <span>Unit {building.units_list?.find((u: any) => u.id === invite.unitId)?.unitNumber || "Unknown"}</span>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Building Wide</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-text-400">
                                                        {new Date(invite.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 font-bold text-sol-indigo hover:bg-sol-indigo/5"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(invite.code);
                                                                alert("Code copied!");
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-text-300 italic">
                                                    No active invitation codes found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="overview" className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-6 border-none bg-white shadow-sm">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-sol-indigo" /> Revenue Performance
                                    </h6>
                                    <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center text-text-grey text-xs italic border border-dashed border-slate-200">
                                        [Monthly Yield Trends Analytics]
                                    </div>
                                </Card>
                                <Card className="p-6 border-none bg-white shadow-sm">
                                    <h6 className="text-auth-navy font-bold mb-4 flex items-center gap-2">
                                        <History size={16} className="text-sol-indigo" /> Asset Details
                                    </h6>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-background-50 pb-3">
                                            <span className="text-sm text-text-grey font-medium">Total Units</span>
                                            <span className="font-bold text-auth-navy">{building.units} Units</span>
                                        </div>
                                        <div className="flex justify-between border-b border-background-50 pb-3">
                                            <span className="text-sm text-text-grey font-medium">Current Occupancy</span>
                                            <span className="font-bold text-sol-emerald">{building.occupied} / {building.units}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-background-50 pb-3">
                                            <span className="text-sm text-text-grey font-medium">City / Country</span>
                                            <span className="font-bold text-auth-navy">{building.city}, {building.country}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-auth-navy text-white border-none shadow-2xl rounded-[32px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-tiny font-bold opacity-60 uppercase tracking-widest">Projected Yield</p>
                                <h2 className="text-3xl text-white font-black mt-1">
                                    {building.monthlyyield?.toLocaleString() || "0"} <span className="text-sm opacity-60 font-bold">USDC</span>
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-tiny font-bold text-sol-emerald uppercase tracking-widest">Available Now</p>
                                <h2 className="text-3xl text-sol-emerald font-black mt-1">
                                    {(() => {
                                        const now = Math.floor(Date.now() / 1000);
                                        const collectable = building.units_list
                                            ?.flatMap((u: any) => u.leases || [])
                                            .filter((l: any) => {
                                                const dueTime = l.nextDueTimestamp ? Number(l.nextDueTimestamp) : (l.startDate ? Math.floor(new Date(l.startDate).getTime() / 1000) : null);
                                                const isDue = dueTime !== null ? dueTime <= now : false;
                                                return l.status === "ACTIVE" && l.tenant?.walletAddress && isDue && l.autoPayEnabled === true;
                                            })
                                            .reduce((sum: number, l: any) => sum + (l.monthlyRent || 0), 0);
                                        return collectable?.toLocaleString() || "0";
                                    })()} <span className="text-sm opacity-60 font-bold">USDC</span>
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleCollectRent}
                                disabled={isCollecting}
                                className="w-full bg-sol-emerald hover:bg-sol-emerald/90 text-white font-black h-14 rounded-2xl shadow-lg shadow-sol-emerald/20 transition-all active:scale-[0.98]"
                            >
                                {isCollecting ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm">Collecting Rent...</span>
                                        <p className="text-[10px] opacity-70 font-medium lowercase tracking-tighter">{collectionProgress}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Wallet size={18} />
                                        Collect All Rent
                                    </div>
                                )}
                            </Button>
                            <Button
                                onClick={handleViewWallet}
                                variant="outline"
                                className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white h-14 rounded-2xl font-bold transition-all active:scale-[0.98]"
                            >
                                View Wallet Address
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-none shadow-sm rounded-[32px]">
                        <h6 className="text-auth-navy font-bold mb-6 flex items-center gap-2">
                             Quick Portfolio Stats
                        </h6>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-background-50/50 rounded-2xl text-center border border-background-100">
                                <Users size={20} className="mx-auto mb-2 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase font-black tracking-widest">Occupancy</p>
                                <p className="font-black text-xl text-primary-900 mt-1">
                                    {building.units ? Math.round(((building.occupied || 0) / building.units) * 100) : 0}%
                                </p>
                            </div>
                            <div className="p-4 bg-background-50/50 rounded-2xl text-center border border-background-100">
                                <TrendingUp size={20} className="mx-auto mb-2 text-sol-indigo" />
                                <p className="text-[10px] text-text-grey uppercase font-black tracking-widest">Avg Rent</p>
                                <p className="font-black text-xl text-primary-900 mt-1">
                                    {building.units ? Math.round((building.monthlyyield || 0) / building.units).toLocaleString() : "0"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ heading, value }: { heading: string, value: string }) {
    return (
        <Card className="bg-white border-none shadow-sm rounded-3xl p-6">
            <div className="space-y-1">
                <p className="text-text-400 uppercase tracking-widest text-[10px] font-black">{heading}</p>
                <h3 className="text-3xl font-black text-primary-900 tracking-tight">{value}</h3>
            </div>
        </Card>
    );
}
