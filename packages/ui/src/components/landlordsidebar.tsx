"use client"
import { Banknote, FileText, Hotel, LayoutDashboard, LogOut, Settings, Users, Home, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function LandlordSidebar() {
    const pathname = usePathname();

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
                {landlordSidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <motion.div
                            key={item.title}
                            whileHover="hover"
                            className="w-full px-2"
                        >
                            <a href={item.href}>
                                <motion.div
                                    variants={{
                                        hover: {
                                            scale: 1.02,
                                            transition: { type: "spring", stiffness: 400, damping: 20 }
                                        }
                                    }}
                                    className={`flex flex-row gap-3 justify-start items-center w-full p-4 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-accent-500/10 border-l-4 border-accent-500 text-accent-600 shadow-[0_0_15px_rgba(110,89,255,0.1)]'
                                        : 'hover:bg-background-100 text-text-500'
                                        }`}
                                >
                                    <div className={`${isActive ? 'text-accent-500' : 'text-inherit opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                                        {item.iconComponent}
                                    </div>

                                    <div className={`hidden md:inline font-black text-[11px] tracking-[0.1em] ${isActive ? 'text-accent-700' : 'text-inherit opacity-70'}`}>
                                        {item.title}
                                    </div>
                                </motion.div>
                            </a>
                        </motion.div>
                    );
                })}
            </div>
            <div className="flex flex-row gap-2 justify-start items-center w-full h-1/4 p-4 ">

                <motion.div
                    key="logout"
                    whileHover="hover"
                    className="w-full"
                >
                    <a href="/landlord/logout">
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
                                variants={{ hover: { color: "var(--color-secondary-500)" } }}
                                className="text-text-500"
                            >
                                <LogOut />
                            </motion.div>

                            <motion.div
                                variants={{ hover: { color: "var(--color-secondary-500)" } }}
                                className="hidden md:inline text-text-600 font-bold text-sm"
                            >
                                LOGOUT
                            </motion.div>
                        </motion.div>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}

const landlordSidebarItems = [
    {
        title: "DASHBOARD",
        href: "/landlord/dashboard",
        iconComponent: < LayoutDashboard />
    },
    {
        title: "BUILDINGS",
        href: "/landlord/buildings",
        iconComponent: <Hotel />
    },
    {
        title: "TENANTS",
        href: "/landlord/tenants",
        iconComponent: <Users />
    },
    {
        title: "LEASES",
        href: "/landlord/leases",
        iconComponent: <FileText />
    },
    {
        title: "PAYMENTS",
        href: "/landlord/payments",
        iconComponent: <Banknote />
    },
    {
        title: "SETTINGS",
        href: "/landlord/settings",
        iconComponent: <Settings />
    },

];