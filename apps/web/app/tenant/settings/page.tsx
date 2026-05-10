"use client";

import React from "react";
import { User, Shield, CreditCard, FileText, Smartphone, Save } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Profile } from "@/components/tenant/settings/profile";
import { PaymentMethods } from "@/components/tenant/settings/paymentmethod";
import { SecurityPrivacy } from "@/components/tenant/settings/settings";

export default function Settings() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-auth-navy tracking-tight">Personal Settings</h1>
                    <p className="text-sm text-text-grey font-medium">Manage your identity, wallet connections, and residency documents.</p>
                </div>
                <Button className="bg-auth-navy hover:bg-auth-slate text-white rounded-2xl px-8 h-12 font-bold shadow-lg flex gap-2">
                    <Save className="h-4 w-4" /> Update Profile
                </Button>
            </header>

            <div className="grid grid-cols-1 gap-10">
                <Profile />
                <PaymentMethods />
                <SecurityPrivacy />
            </div>
        </div>
    );
}