"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/store/useAuth";

interface ProfileProps {
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    errors?: Record<string, string>;
}

export function Profile({ name, setName, email, setEmail, phone, setPhone, errors = {} }: ProfileProps) {
    const { user } = useAuth();

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2 text-primary-900">
                    <UserIcon className="h-5 w-5 text-secondary-500" />
                    <h2 className="text-lg font-black uppercase tracking-wider">Identity</h2>
                </div>
                <Badge className="bg-secondary-500/10 text-secondary-500 border-none font-black px-4 py-1 rounded-full text-[10px]">
                    VERIFIED {user?.role || 'TENANT'}
                </Badge>
            </div>

            <Card className="rounded-3xl border-background-100 bg-white shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-400">Legal Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900 ${errors.name ? 'ring-1 ring-destructive' : ''}`}
                        />
                        {errors.name && <p className="text-[10px] font-bold text-destructive px-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-400">Email Address</Label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900 ${errors.email ? 'ring-1 ring-destructive' : ''}`}
                        />
                        {errors.email && <p className="text-[10px] font-bold text-destructive px-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-400">Wallet Address</Label>
                        <Input readOnly value={user?.walletAddress} className="h-12 rounded-xl bg-background-50 border-none font-mono text-xs text-text-400 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-400">Emergency Contact</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (xxx) xxx-xxxx"
                            className={`h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900 ${errors.phone ? 'ring-1 ring-destructive' : ''}`}
                        />
                        {errors.phone && <p className="text-[10px] font-bold text-destructive px-1">{errors.phone}</p>}
                    </div>
                </div>
            </Card>
        </section>
    );
}