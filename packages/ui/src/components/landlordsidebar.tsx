"use client"
import { Banknote, Hotel, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function LandlordSidebar() {
    return (
        <div className="w-16 md:w-64 flex flex-col gap-4 justify-center items-center h-screen shadow-2xl bg-[#F1F5F9]">
            <div className="flex flex-col w-full h-3/4">
                <div className="flex flex-row  justify-start items-center w-full">

                    <h2 className="text-sol-indigo m-0 font-bold text-xl tracking-tight p-4">SOLRENT</h2>
                </div>
                {landlordSidebarItems.map((item) => (

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
                                variants={{
                                    hover: { color: "#10B981" } 
                                }}
                                className="text-text-muted"
                            >
                                <LogOut />
                            </motion.div>

                            <motion.div
                                variants={{
                                    hover: { color: "#10B981" }
                                }}
                                className="hidden md:inline text-text-muted font-medium"
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
        href: "/landlord",
        iconComponent: < LayoutDashboard />
    },
    {
        title: "BUILDINGS",
        href: "/landlord/myleases",
        iconComponent: <Hotel />
    },
    {
        title: "TENANTS",
        href: "/landlord/payments",
        iconComponent: <Users />
    },
    {
        title: "PAYMENTS",
        href: "/landlord/nfts",
        iconComponent: <Banknote />
    },
    {
        title: "SETTINGS",
        href: "/landlord/settings",
        iconComponent: <Settings />
    },

];