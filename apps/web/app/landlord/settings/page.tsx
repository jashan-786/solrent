"use client";

import React from "react";
import { User, Wallet, Bell, Shield, Building, Save } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Profile } from "@/components/landlord/settings/profile";
import { WalletSection } from "@/components/landlord/settings/walletsection";
import { PreferencesSection } from "@/components/landlord/settings/preferences";

export default function Settings() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-auth-navy tracking-tight">Account Settings</h1>
                    <p className="text-sm text-text-grey font-medium">Manage your identity, treasury wallets, and global lease defaults.</p>
                </div>
                <Button className="bg-sol-indigo hover:bg-sol-indigo/90 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-indigo-100 flex gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                </Button>
            </header>

            <div className="grid grid-cols-1 gap-10">
                <Profile />
                <WalletSection />
                <PreferencesSection />
            </div>
        </div>
    );
}