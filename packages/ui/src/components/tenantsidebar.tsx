"use client";
import { Banknote, ClipboardMinus, FileBox, LayoutDashboard, LogIn, LogOut, Settings, Home, Zap } from "lucide-react";

import { motion } from "framer-motion";
export default function TenantSidebar() {
    return (
        <div className="w-16 md:w-64 h-screen flex fixed flex-col gap-4 justify-center items-center rounded-r-2xl border-r border-background-200 shadow-xl bg-background-50 z-50">
            <div className="flex flex-col w-full h-3/4">
                <div className="flex items-center gap-3 p-4 w-full cursor-default border-b border-background-200/50 mb-4 pb-6">
                    <div className="relative flex items-center justify-center h-8 w-8 min-w-[2rem] rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-md">
                        <Home className="h-4 w-4 text-white absolute z-10" />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-background-100 rounded-full flex items-center justify-center shadow-sm">
                            <Zap className="h-2.5 w-2.5 text-secondary-500 fill-secondary-500" />
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-text-950 leading-none">
                            Sol<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-secondary-500">Rent</span>
                        </span>
                    </div>
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
                                    variants={{ hover: { color: "var(--color-accent-500)" } }}
                                    className="text-text-500"
                                >
                                    {item.iconComponent}
                                </motion.div>

                                <motion.div
                                    variants={{ hover: { color: "var(--color-accent-500)" } }}
                                    className="hidden md:inline text-text-600 font-bold text-sm tracking-wide"
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
                    <div className="flex flex-row gap-3 p-4 justify-start items-center w-full hover:bg-background-200/50 rounded-xl transition-all text-text-500 hover:text-secondary-500">
                        <LogOut />
                        <div className="hidden md:inline font-bold text-sm ">LOGOUT</div>
                    </div>
                </a>
            </div>
        </div>
    );
}



const tenantSidebarItems = [
    {
        title: "DASHBOARD",
        href: "/tenant/dashboard",
        iconComponent: < LayoutDashboard />
    },
    {
        title: "MY LEASE",
        href: "/tenant/leases",
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