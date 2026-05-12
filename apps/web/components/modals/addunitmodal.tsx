"use client";

import { useState } from "react";
import axios from "axios";
import { mutate } from "swr";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { LayoutGrid, Plus, Loader2 } from "lucide-react";

export function AddUnitModal({ buildingId, children }: { buildingId: string, children?: React.ReactNode }) {
    const [unitNumber, setUnitNumber] = useState("");
    const [rentAmount, setRentAmount] = useState("");
    const [bedrooms, setBedrooms] = useState("1");
    const [bathrooms, setBathrooms] = useState("1");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post("/api/landlord/units", {
                buildingId,
                unitNumber,
                rentAmount: parseFloat(rentAmount),
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                occupied: false
            });

            mutate(`/api/landlord/building/${buildingId}`);
            mutate(`/api/landlord/units?buildingId=${buildingId}`);
            setOpen(false);

            setUnitNumber("");
            setRentAmount("");
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button variant="outline" className="font-bold gap-2">
                        <Plus size={18} /> Add Unit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary-900">Add New Unit</DialogTitle>
                    <DialogDescription className="text-text-500">
                        Register a new unit for this building.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="unitNumber" className="text-tiny font-bold uppercase text-primary-900">Unit Number</Label>
                        <Input id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="A-101" className="bg-background-100 border-none" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rentAmount" className="text-tiny font-bold uppercase text-primary-900">Monthly Rent (USDC)</Label>
                        <Input id="rentAmount" type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="2000" className="bg-background-100 border-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bedrooms" className="text-tiny font-bold uppercase text-primary-900">Bedrooms</Label>
                            <Input id="bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="bg-background-100 border-none" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bathrooms" className="text-tiny font-bold uppercase text-primary-900">Bathrooms</Label>
                            <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="bg-background-100 border-none" />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !unitNumber || !rentAmount}
                        className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold h-12"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Register Unit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
