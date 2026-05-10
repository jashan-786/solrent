"use client";

import useSWR from "swr";
import axios from "axios";
import { Loader2, Bell, CheckCircle2 } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function NotificationsPage() {
    const { data, isLoading } = useSWR("/api/landlord/notifications", fetcher);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
    );

    const notifications = data?.notifications || [];

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-primary-950 rounded-2xl text-white">
                    <Bell className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-primary-900 tracking-tight">Notifications Center</h1>
                    <p className="text-text-500 font-medium">All system alerts and tenant maintenance requests.</p>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
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
        </div>
    );
}
