"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
export function HeroCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    const [hovered, setHovered] = useState(true);

    return (

        <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer w-3/4 md:w-full bg-white border-0 rounded-xl shadow-2xl"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Card className="w-full  border-0 rounded-xl shadow-2xl" >

                <CardHeader>
                    <div className={`flex flex-row items-center gap-2 border rounded-full max-w-max p-2 ${hovered ? "bg-sol-emerald" : "bg-gray-100"}`}>
                        {icon}

                    </div>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{description}</p>
                </CardContent>

            </Card >
        </motion.div>
    )
}