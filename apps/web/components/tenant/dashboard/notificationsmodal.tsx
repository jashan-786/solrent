import { useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { Loader2, Bell, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface TenantNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TenantNotificationsModal({ isOpen, onClose }: TenantNotificationsModalProps) {
    const { data, isLoading, mutate } = useSWR(isOpen ? "/api/tenant/notifications" : null, fetcher);

    useEffect(() => {
        if (isOpen) mutate();
    }, [isOpen, mutate]);

    const notifications = data?.notifications || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-background-50 border-none rounded-[32px] overflow-hidden p-0 gap-0 max-h-[85vh] flex flex-col">
                <DialogHeader className="p-8 pb-6 bg-white border-b border-background-100 flex flex-row justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-950 rounded-xl text-white">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-primary-900 tracking-tight">
                                Notifications
                            </DialogTitle>
                            <p className="text-text-500 font-medium text-sm mt-1">All system alerts and updates.</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 overflow-y-auto flex-1 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((n: any) => (
                            <div key={n.id} className={`p-6 rounded-[24px] border transition-all ${n.isRead ? 'bg-white border-background-100 shadow-sm' : 'bg-secondary-50/50 border-secondary-200 shadow-md'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest bg-secondary-100/50 px-3 py-1 rounded-md">
                                            {n.type}
                                        </span>
                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary-500" />}
                                    </div>
                                    <span className="text-xs text-text-400 font-bold">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-1">{n.title}</h3>
                                <p className="text-sm text-text-600 font-medium leading-relaxed">{n.message}</p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[32px] border border-background-100 p-16 text-center shadow-sm">
                            <div className="flex justify-center mb-6">
                                <div className="p-6 bg-background-50 rounded-full">
                                    <CheckCircle2 className="h-10 w-10 text-secondary-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-primary-900 mb-2">You're all caught up!</h3>
                            <p className="text-text-400 text-sm">No notifications to display.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

