"use client";
import { Banknote, ClipboardMinus, FileBox, LayoutDashboard, LogIn, LogOut, Settings } from "lucide-react";

import { motion } from "framer-motion";
export default function TenantSidebar() {
    return (
        <div className="w-16 md:w-64 flex flex-col gap-4 justify-center items-center h-screen shadow-2xl bg-[#F1F5F9]">
            <div className="flex flex-col w-full h-3/4">
                <div className="flex flex-row  justify-start items-center w-full">

                    <h2 className="text-sol-indigo m-0 font-bold text-xl tracking-tight p-4">SOLRENT</h2>
                </div>
                {tenantSidebarItems.map((item) => (
                    <motion.div
                        key={item.title}
                        whileHover="hover" 
                        className="w-full"
                    >
                        <a href={item.href}>
                            <motion.div
                                variants={{
                                    hover: {
                                        scale: 1.05,
                                        transition: { type: "spring", stiffness: 400, damping: 20 }
                                    }
                                }}
                                className="flex flex-row gap-3 justify-start items-center w-full p-4 rounded-twelve transition-colors duration-200 hover:bg-solrent-surface/50"
                            >
                                <motion.div
                                    variants={{
                                        hover: { color: "#10B981" } 
                                    }}
                                    className="text-text-muted"
                                >
                                    {item.iconComponent}
                                </motion.div>

                                <motion.div
                                    variants={{
                                        hover: { color: "#10B981" }
                                    }}
                                    className="hidden md:inline text-text-muted font-medium"
                                >
                                    {item.title}
                                </motion.div>
                            </motion.div>
                        </a>
                    </motion.div>
                ))}
            </div>
            <div className="flex flex-row gap-2 justify-start items-center w-full h-1/4 p-4 ">

                <a href="/tenant/logout">
                    <div className="flex flex-row gap-2 justify-start items-center w-full">
                        <LogOut />
                        <div className="hidden md:inline text-[#64748B]">LOGOUT</div>
                    </div>
                </a>
            </div>
        </div>
    );
}



const tenantSidebarItems = [
    {
        title: "DASHBOARD",
        href: "/tenant",
        iconComponent: < LayoutDashboard />
    },
    {
        title: "MY LEASE",
        href: "/tenant/myleases",
        iconComponent: < ClipboardMinus />
    },
    {
        title: "PAYMENTS",
        href: "/tenant/payments",
        iconComponent: <Banknote />
    },
    {
        title: "NFTs/RECIPTS",
        href: "/tenant/nfts",
        iconComponent: <FileBox />
    },
    {
        title: "SETTINGS",
        href: "/tenant/settings",
        iconComponent: <Settings />
    },

];