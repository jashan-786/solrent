import React from 'react';
import { Download, MoreVertical, CheckCircle2, Circle } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";

const PaymentTab = () => {
    return (
        <div className="p-6 space-y-6 font-sans text-[#1a1c1e]">

            {/* SECTION 1: Payment Schedule */}
            <div className=" bg-white rounded-[32px]  shadow-sm overflow-hidden">
                <div className="p-8 bg-surface-secondary  flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-2xl font-bold">Payment Schedule</h2>
                    <Button variant="ghost" className="text-[#3d7a5d] hover:text-[#2d5c46] font-semibold gap-2">
                        <Download className="w-4 h-4" /> Export History
                    </Button>
                </div>

                <div className="p-0">
                    {/* Table Headers */}
                    <div className="grid grid-cols-4 px-8 py-4 bg-gray-50/50 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        <div>Period</div>
                        <div>Amount</div>
                        <div>Type</div>
                        <div>Status</div>
                    </div>

                    {/* Schedule Rows */}
                    {[
                        { period: "December 2023", date: "Dec 01, 2023", sol: "45.00", usd: "2,840.50", status: "Pending", action: "Modify" },
                        { period: "January 2024", date: "Jan 01, 2024", sol: "45.00", usd: "2,840.50", status: "Scheduled", action: "icon" }
                    ].map((item, idx) => (
                        <div key={idx} className="grid grid-cols-4 px-8 py-8 items-center border-b border-gray-50 last:border-0">
                            <div className="space-y-1">
                                <div className="font-bold text-lg leading-tight">{item.period.split(' ')[0]}<br />{item.period.split(' ')[1]}</div>
                                <div className="text-xs text-gray-400 font-medium">Due {item.date}</div>
                            </div>

                            <div className="space-y-0.5">
                                <div className="font-bold text-lg">{item.sol} SOL</div>
                                <div className="text-xs text-gray-400 font-medium">≈ ${item.usd} USD</div>
                            </div>

                            <div>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
                                    Recurring
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                    {item.status}
                                </div>
                                {item.action === "Modify" ? (
                                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs px-6 border-gray-200">Modify</Button>
                                ) : (
                                    <Button variant="ghost" size="icon" className="text-gray-400"><MoreVertical className="w-5 h-5" /></Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 2: Payment Journey Timeline */}
            <div className=" bg-white rounded-[32px]  shadow-sm overflow-hidden"><div className="p-8 bg-surface-secondary  flex justify-between items-center border-b border-gray-50">
                <h2 className="text-2xl font-bold">Payment Journey Timeline</h2>

            </div>
                <div className="space-y-0 p-8">
                    {[
                        { title: "September 2023 Payment", sub: "Confirmed on Solana Mainnet • 0x4f...9e2", right: "NFT Minted", date: "OCT 01, 2023", done: true },
                        { title: "October 2023 Payment", sub: "Confirmed on Solana Mainnet • 0x8a...3d4", right: "NFT Minted", date: "NOV 01, 2023", done: true },
                        { title: "November 2023 Payment", sub: "Active Period • Awaiting validation", right: "In Progress", date: "", done: false }
                    ].map((step, idx, arr) => (
                        <div key={idx} className="relative flex gap-6 pb-12 last:pb-0">
                            {/* Vertical Connector Line */}
                            {idx !== arr.length - 1 && (
                                <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gray-100" />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 bg-white">
                                {step.done ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-400 fill-green-50" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-[3px] border-black flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-black" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex justify-between items-start pt-0.5">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-[#111]">{step.title}</h4>
                                    <p className="text-sm text-gray-400 font-medium">{step.sub}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[11px] font-bold tracking-wide uppercase ${step.done ? 'text-[#3d7a5d]' : 'text-gray-500 italic'}`}>
                                        {step.right}
                                    </div>
                                    {step.date && <div className="text-[10px] font-bold text-gray-300 mt-1 uppercase">{step.date}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentTab;