"use client";

import React, { useState } from "react";
import axios from "axios";
import {
    UserPlus, Copy, Check, Loader2, ShieldCheck
} from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function InviteTenantModal({ isVerified = true }: { isVerified?: boolean }) {
    const { data: buildingsData } = useSWR("/api/landlord/buildings", fetcher);
    const [selectedBuilding, setSelectedBuilding] = useState<string>("");
    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const { data: unitsData } = useSWR(selectedBuilding ? `/api/landlord/units?buildingId=${selectedBuilding}` : null, fetcher);
    
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!selectedBuilding) return;
        setLoading(true);
        try {
            const res = await axios.post("/api/landlord/invite-codes", {
                buildingId: selectedBuilding,
                unitId: selectedUnit || null
            });
            setInviteCode(res.data.inviteCode);
        } catch (e) {
            
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog onOpenChange={(open) => !open && setInviteCode(null)}>
            <DialogTrigger asChild>
                <Button className="bg-secondary-500 hover:bg-secondary-600 text-white gap-2 rounded-xl h-11 px-6 shadow-sm">
                    <UserPlus className="h-4 w-4" /> Invite Tenant
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-none bg-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary-900">Invite New Tenant</DialogTitle>
                    <DialogDescription className="text-text-500">
                        Generate a unique invitation code for your tenant to register.
                    </DialogDescription>
                </DialogHeader>

                {!isVerified ? (
                    <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-amber-700 font-bold">
                            <ShieldCheck className="h-5 w-5" />
                            Action Required
                        </div>
                        <p className="text-sm text-amber-600 leading-relaxed">
                            Your wallet must be verified before you can invite tenants. Please complete your wallet setup on the dashboard to initialize your USDC account.
                        </p>
                    </div>
                ) : !inviteCode ? (
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-text-400">Select Property</label>
                            <select 
                                value={selectedBuilding} 
                                onChange={(e) => {
                                    setSelectedBuilding(e.target.value);
                                    setSelectedUnit("");
                                }}
                                className="w-full h-12 rounded-xl bg-background-100 border-none px-4 text-primary-900 font-bold focus:ring-2 focus:ring-secondary-500 transition-all outline-none cursor-pointer"
                            >
                                <option value="">Choose a building...</option>
                                {buildingsData?.buildings?.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedBuilding && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-400">Select Unit (Optional)</label>
                                <select 
                                    value={selectedUnit} 
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="w-full h-12 rounded-xl bg-background-100 border-none px-4 text-primary-900 font-bold focus:ring-2 focus:ring-secondary-500 transition-all outline-none cursor-pointer"
                                >
                                    <option value="">All Units / General Invite</option>
                                    {unitsData?.units?.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.unitNumber} (${u.rentAmount})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Button 
                            onClick={handleGenerate} 
                            disabled={loading || !selectedBuilding}
                            className="w-full h-12 rounded-xl bg-primary-900 text-white font-bold hover:bg-primary-950 transition-colors shadow-lg"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Invite Code"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 mt-4 text-center">
                        <div className="p-8 bg-secondary-50 rounded-2xl border-2 border-dashed border-secondary-200 group">
                            <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-[0.2em] mb-3">Invitation Code</p>
                            <h2 className="text-5xl font-black text-primary-900 tracking-wider font-mono">{inviteCode}</h2>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-background-200 font-bold text-primary-900 hover:bg-background-50" onClick={() => setInviteCode(null)}>
                                Create New
                            </Button>
                            <Button className="flex-1 h-12 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-bold gap-2 shadow-md transition-all" onClick={copyToClipboard}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? "Copied!" : "Copy Code"}
                            </Button>
                        </div>

                        <p className="text-xs text-text-400 leading-relaxed">
                            Share this code with your tenant. They can enter it during registration to automatically link their lease.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}