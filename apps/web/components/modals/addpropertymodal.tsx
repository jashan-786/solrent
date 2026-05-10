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

import { Building2, ImagePlus, Plus } from "lucide-react";



export function AddPropertyModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-sol-indigo hover:bg-sol-indigo/90 text-white font-bold gap-2">
                    <Plus size={18} /> Add Property
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-auth-navy text-2xl font-heading flex items-center gap-2">
                        <Building2 className="text-sol-indigo" /> Register New Asset
                    </DialogTitle>
                    <DialogDescription className="text-text-grey">
                        Minting a new property NFT requires complete architectural and location data.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">

                    <div className="grid gap-2">
                        <Label className="text-tiny font-bold uppercase text-auth-navy">Property Image</Label>
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-surface-secondary hover:bg-slate-100 transition-colors cursor-pointer group">
                            <label htmlFor="img-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                <ImagePlus className="text-text-grey group-hover:text-sol-indigo transition-colors" size={24} />
                                <span className="text-xs text-text-grey mt-2">Click to upload local photo</span>
                                <input id="img-upload" type="file" accept="image/*" className="hidden" />
                            </label>
                        </div>
                    </div>
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-tiny font-bold uppercase text-auth-navy">Property Name</Label>
                            <Input id="name" placeholder="Skyline Loft A4" className="bg-surface-secondary border-none" />
                        </div>
                    </div>

                    {/* Address Row (Full Width) */}
                    <div className="grid gap-2">
                        <Label htmlFor="address" className="text-tiny font-bold uppercase text-auth-navy">Street Address</Label>
                        <Input id="address" placeholder="123 Main St" className="bg-surface-secondary border-none" />
                    </div>

                    {/* Location Grid: 3 Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city" className="text-tiny font-bold uppercase text-auth-navy">City</Label>
                            <Input id="city" placeholder="Winnipeg" className="bg-surface-secondary border-none" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state" className="text-tiny font-bold uppercase text-auth-navy">State/Prov</Label>
                            <Input id="state" placeholder="MB" className="bg-surface-secondary border-none" />
                        </div>
                        <div className="grid gap-2 col-span-2 md:col-span-1">
                            <Label htmlFor="zip" className="text-tiny font-bold uppercase text-auth-navy">Zip/Postal</Label>
                            <Input id="zip" placeholder="R3C 2P4" className="bg-surface-secondary border-none" />
                        </div>
                    </div>

                    {/* Units & Occupancy Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="units" className="text-tiny font-bold uppercase text-auth-navy">Total Units</Label>
                            <Input id="units" type="number" placeholder="20" className="bg-surface-secondary border-none" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="occupied" className="text-tiny font-bold uppercase text-auth-navy">Occupied</Label>
                            <Input id="occupied" type="number" placeholder="18" className="bg-surface-secondary border-none" />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="yield" className="text-tiny font-bold uppercase text-auth-navy">Monthly Yield ($)</Label>
                            <Input id="yield" type="number" placeholder="4500" className="bg-surface-secondary border-none text-sol-emerald font-bold" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="ghost" className="text-text-grey font-bold">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-sol-emerald hover:bg-sol-emerald/90 text-white font-bold px-10">
                        Add Property

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}