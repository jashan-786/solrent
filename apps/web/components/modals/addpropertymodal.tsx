"use client";

import { useState } from "react";
import axios from "axios";
import { mutate } from "swr";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Building2, Plus, Loader2 } from "lucide-react";
import { buildingSchema } from "@/app/api/zod";

export function AddPropertyModal() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        setErrors({});

        const result = buildingSchema.safeParse({
            name,
            address,
            city,
            province: state,
            postalCode: zip
        });

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await axios.post("/api/landlord/buildings", result.data);

            mutate("/api/landlord/buildings");
            mutate("/api/landlord/dashboard");
            setOpen(false);

            setName("");
            setAddress("");
            setCity("");
            setState("");
            setZip("");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create building");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold gap-2">
                    <Plus size={18} /> Add Property
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary-900 text-2xl font-bold flex items-center gap-2">
                        <Building2 className="text-secondary-500" /> Register New Building
                    </DialogTitle>
                    <DialogDescription className="text-text-500">
                        Enter the building details to add it to your portfolio.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-tiny font-bold uppercase text-primary-900">Building Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Skyline Loft" className={`bg-background-100 border-none ${errors.name ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address" className="text-tiny font-bold uppercase text-primary-900">Street Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" className={`bg-background-100 border-none ${errors.address ? 'ring-2 ring-red-500' : ''}`} />
                        {errors.address && <p className="text-red-500 text-[10px] font-bold">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city" className="text-tiny font-bold uppercase text-primary-900">City</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Winnipeg" className={`bg-background-100 border-none ${errors.city ? 'ring-2 ring-red-500' : ''}`} />
                            {errors.city && <p className="text-red-500 text-[10px] font-bold">{errors.city}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state" className="text-tiny font-bold uppercase text-primary-900">Province</Label>
                            <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="MB" className={`bg-background-100 border-none ${errors.province ? 'ring-2 ring-red-500' : ''}`} />
                            {errors.province && <p className="text-red-500 text-[10px] font-bold">{errors.province}</p>}
                        </div>
                        <div className="grid gap-2 col-span-2 md:col-span-1">
                            <Label htmlFor="zip" className="text-tiny font-bold uppercase text-primary-900">Postal Code</Label>
                            <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="R3C 2P4" className={`bg-background-100 border-none ${errors.postalCode ? 'ring-2 ring-red-500' : ''}`} />
                            {errors.postalCode && <p className="text-red-500 text-[10px] font-bold">{errors.postalCode}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="ghost" className="text-text-500 font-bold">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold px-10"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Add Property"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}