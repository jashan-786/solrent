import { useState } from "react";
import axios from "axios";
import { X, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingId: string;
    unitId: string;
}

export function MaintenanceModal({ isOpen, onClose, buildingId, unitId }: MaintenanceModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("LOW");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/api/tenant/maintenance", {
                title,
                description,
                priority,
                buildingId,
                unitId
            });
            alert("Maintenance request submitted successfully!");
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-background-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-background-100 flex justify-between items-center bg-background-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-primary-900 tracking-tight">Request Maintenance</h2>
                        <p className="text-text-500 text-sm font-medium mt-1">Submit an issue to your landlord</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-text-400" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-400 uppercase tracking-widest">Issue Title</label>
                            <input
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-primary-900 font-bold focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all placeholder:text-text-300 placeholder:font-medium"
                                placeholder="e.g., Leaking Faucet"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-400 uppercase tracking-widest">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-text-600 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all placeholder:text-text-300 resize-none"
                                placeholder="Please describe the issue in detail..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-400 uppercase tracking-widest">Priority</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["LOW", "MEDIUM", "HIGH"].map((p) => (
                                    <button
                                        type="button"
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            priority === p
                                                ? p === "HIGH" ? "border-destructive bg-destructive/10 text-destructive" : "border-secondary-500 bg-secondary-50 text-secondary-600"
                                                : "border-background-200 bg-background-50 text-text-400 hover:border-background-300"
                                        }`}
                                    >
                                        {p === "HIGH" ? <AlertTriangle className="w-5 h-5 mb-2" /> : <AlertCircle className="w-5 h-5 mb-2" />}
                                        <span className="text-xs font-bold uppercase tracking-wider">{p}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading || !title || !description}
                            className="w-full py-6 rounded-xl font-bold text-base mt-4 bg-primary-900 hover:bg-primary-800 text-white"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
