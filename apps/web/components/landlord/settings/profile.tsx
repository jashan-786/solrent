import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Camera, User, Mail, Phone, MapPin } from "lucide-react";

export function Profile() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-auth-navy ml-1">
                <User className="h-5 w-5 text-sol-indigo" />
                <h2 className="text-lg font-black uppercase tracking-wider">Identity & Branding</h2>
            </div>

            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-10 items-start">

                        {/* AVATAR / LOGO UPLOAD */}
                        <div className="relative group">
                            <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-inner">
                                <AvatarImage src="" /> {/* Add landlord's image source here */}
                                <AvatarFallback className="bg-surface-secondary text-auth-navy text-3xl font-black italic">
                                    JS
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-1 right-1 bg-sol-indigo text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>

                        {/* FORM FIELDS */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey ml-1">Full Name / Entity</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input defaultValue="Jashanpreet Singh" className="pl-12 h-12 rounded-xl bg-surface-secondary border-none font-bold text-auth-navy" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey ml-1">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input defaultValue="j.singh@example.com" className="pl-12 h-12 rounded-xl bg-surface-secondary border-none font-bold text-auth-navy" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey ml-1">Business Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input defaultValue="+1 (204) 000-0000" className="pl-12 h-12 rounded-xl bg-surface-secondary border-none font-bold text-auth-navy" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-text-grey ml-1">Office Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input defaultValue="Winnipeg, MB, Canada" className="pl-12 h-12 rounded-xl bg-surface-secondary border-none font-bold text-auth-navy" />
                                </div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </section>
    );
}