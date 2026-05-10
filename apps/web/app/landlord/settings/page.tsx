"use client";

import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Profile } from "@/components/landlord/settings/profile";
import { WalletSection } from "@/components/landlord/settings/walletsection";
import { PreferencesSection } from "@/components/landlord/settings/preferences";
import { useAuth } from "@/store/useAuth";
import axios from "axios";

export default function Settings() {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const res = await axios.put("/api/landlord/settings", { name, email, phone: phone || undefined });
            if (res.data.success) {
                setUser(res.data.user);
                setSaveMessage({ type: "success", text: "Settings saved successfully!" });
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch (error) {
            setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
            setTimeout(() => setSaveMessage(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-auth-navy tracking-tight">Account Settings</h1>
                    <p className="text-sm text-text-grey font-medium">Manage your identity, treasury wallets, and global lease defaults.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveMessage && (
                        <span className={`text-sm font-bold ${saveMessage.type === "success" ? "text-secondary-500" : "text-destructive"}`}>
                            {saveMessage.text}
                        </span>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-sol-indigo hover:bg-sol-indigo/90 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-indigo-100 flex gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-10">
                <Profile name={name} setName={setName} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
                <WalletSection />
                <PreferencesSection />
            </div>
        </div>
    );
}