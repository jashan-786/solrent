"use client";

import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Profile } from "@/components/tenant/settings/profile";
import { PaymentMethods } from "@/components/tenant/settings/paymentmethod";
import { SecurityPrivacy } from "@/components/tenant/settings/settings";
import { useAuth } from "@/store/useAuth";
import axios from "axios";

import { z } from "zod";

const settingsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional().refine((val) => !val || /^\+?[\d\s-()]{7,}$/.test(val), {
        message: "Invalid phone number format"
    })
});

export default function Settings() {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [lease, setLease] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get("/api/tenant/settings");
                if (res.data.success) {
                    const u = res.data.user;
                    setName(u.name || "");
                    setEmail(u.email || "");
                    setPhone(u.phone || "");
                    setLease(u.tenantLeases?.[0] || null);
                    setUser({ ...user, ...u });
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setErrors({});
        setSaveMessage(null);

        const validation = settingsSchema.safeParse({ name, email, phone: phone || undefined });
        if (!validation.success) {
            const newErrors: Record<string, string> = {};
            validation.error.issues.forEach(err => {
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);
        try {
            const res = await axios.put("/api/tenant/settings", validation.data);
            if (res.data.success) {
                setUser(res.data.user);
                setSaveMessage({ type: "success", text: "Profile updated successfully!" });
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch (error: any) {
            setSaveMessage({ 
                type: "error", 
                text: error.response?.data?.message || "Failed to update profile." 
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-auth-navy tracking-tight text-primary-900">Personal Settings</h1>
                    <p className="text-sm text-text-grey font-medium">Manage your identity, wallet connections, and residency documents.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveMessage && (
                        <span className={`text-xs font-bold ${saveMessage.type === "success" ? "text-secondary-500" : "text-destructive"}`}>
                            {saveMessage.text}
                        </span>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-900 hover:bg-primary-950 text-white rounded-2xl px-8 h-12 font-bold shadow-lg flex gap-2 transition-all active:scale-95"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Saving..." : "Update Profile"}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-10">
                <Profile 
                    name={name} setName={setName} 
                    email={email} setEmail={setEmail} 
                    phone={phone} setPhone={setPhone}
                    errors={errors}
                />
                <PaymentMethods />
                <SecurityPrivacy lease={lease} />
            </div>
        </div>
    );
}