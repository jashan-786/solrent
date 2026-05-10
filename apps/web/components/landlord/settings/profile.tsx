"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Camera, User, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/store/useAuth";

interface ProfileProps {
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
}

export function Profile({ name, setName, email, setEmail, phone, setPhone }: ProfileProps) {
    const { user } = useAuth();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary-900 ml-1">
                <User className="h-5 w-5 text-secondary-500" />
                <h2 className="text-lg font-black uppercase tracking-wider">Identity & Branding</h2>
            </div>

            <Card className="rounded-[32px] border-background-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 border-4 border-background-50 shadow-inner">
                                <AvatarImage src={user?.landlordBuildingId ? "" : ""} /> 
                                <AvatarFallback className="bg-background-50 text-primary-900 text-3xl font-black">
                                    {name?.slice(0, 2).toUpperCase() || "L"}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-1 right-1 bg-secondary-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-400 ml-1">Full Name / Entity</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-300" />
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-12 h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-400 ml-1">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-300" />
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-400 ml-1">Business Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-300" />
                                    <Input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (xxx) xxx-xxxx"
                                        className="pl-12 h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-400 ml-1">Office Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-300" />
                                    <Input placeholder="Not set" className="pl-12 h-12 rounded-xl bg-background-50 border-none font-bold text-primary-900" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}