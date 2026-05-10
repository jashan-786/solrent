"use client"
import { motion } from "framer-motion";
import { Building, Ellipsis } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge"

import { BadgeCheck } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button";

export function CTA() {
    return (
        <section id="how-it-works" className="w-full h-full  flex flex-col items-center justify-center gap-16 -4 md:px-8 py-10 ">
            <div className="flex flex-col md:flex-row gap-10 p-4">
                <motion.div
                    initial={{ rotate: +2 }}
                    className="w-full p-5 md:w-1/2 bg-background-grey rounded-2xl">
                    <div

                        className=" w-full h-full bg-surface-primary rounded-2xl">
                        <CTAItem1 />
                    </div>
                </motion.div>
                <div className="w-full p-2 md:w-1/2">
                    <CTAItem2 />
                </div>
            </div>

            <CTAItem3 />

        </section>
    );
}

function CTAItem1() {
    return (

        <motion.div className=" w-full h-full flex flex-col gap-4 rounded-2xl shadow-lg bg-card-bg">
            <div className=" flex  flex-row justify-between p-4 items-center shadow">
                <div>
                    <h6> Landlord Portal</h6>
                </div>
                <div>
                    <Ellipsis />
                </div>
            </div>
            <div className="flex flex-col gap-2 ">
                <div className="flex flex-row gap-2 p-3 w-full">
                    <div className="w-1/2  rounded-2xl p-2">
                        <CTAItemLandItem title="PORTFOLIO VALUE" description="42,500 USDC" />
                    </div>
                    <div className="w-1/2   rounded-2xl p-2">
                        <CTAItemLandItem title="OCCUPANCY" description="98.2%" />
                    </div>
                </div>
                <div className="flex gap-3 flex-col p-3">
                    <p className="font-extrabold ">Active Leases</p>
                    <div>

                        <div className="  flex flex-row gap-2 bg-background-grey rounded-2xl  justify-between  items-center p-4">
                            <div className="flex flex-row gap-2 items-center ">
                                <Building className=" text-sol-emerald text-3xl" />
                                <div className="flex flex-col gap-1">
                                    <small className=" font-bold ">Azure Heights #402</small>
                                    <small>2,400 USDC / Month</small>
                                </div>
                            </div>
                            <div>
                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    active
                                </Badge>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </motion.div>

    );
}

function CTAItemLandItem({ title, description }: { title: string, description: string }) {
    return (
        <motion.div className=" flex flex-col gap-2 bg-background-grey rounded-2xl p-4">

            <p className=" text-text-grey font-extrabold">{title}</p>
            <small className="text-black font-bold">{description}</small>

        </motion.div>
    );
}

function CTAItem2() {
    return (
        <motion.div className=" flex  flex-col justify-between items-center gap-3">

            <div>
                <h3>Manage your entire portfolio from a single ledger.</h3>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <p> Connect your Phantom or Solflare wallet and gain instant visibility into tenant performance, payment histories, and occupancy rates. No more spreadsheets, no more chasing checks.</p>
                </div>
                <div>
                    <div className="flex flex-col gap-2">
                        <CTAItem2LandItem description="Multi-property tracking" />
                        <CTAItem2LandItem description="Real-time USDC liquidation" />
                        <CTAItem2LandItem description="Automated tax reporting exports" />
                    </div>

                </div>
            </div>

        </motion.div>
    );
}

function CTAItem2LandItem({ description }: { description: string }) {
    return (
        <motion.div className=" flex flex-col gap-2 ">

            <div className="flex flex-row items-center gap-1">
                <p>
                    <Badge variant="default">
                        <BadgeCheck data-icon="inline-start" />
                    </Badge>
                </p>

                <small className="text-black font-bold">{description}</small>
            </div>

        </motion.div>
    );
}

function CTAItem3() {
    return (
        <div className="w-full md:w-full flex flex-col gap-2 p-2  bg-auth-navy rounded-2xl ">
            <motion.div className="m-16">
                <div className="md:w-full">
                    <div>
                        <h3 className="text-surface-primary">Simplicity by design.</h3>
                    </div>
                    <div className=" flex flex-row justify-between">
                        <div className=" text-surface-tertiary w-1/2">
                            Transitioning to on-chain rent shouldn't be complex. We've distilled the process into three effortless movements.
                        </div>
                        <a href="/register">
                            <Button className="bg-linear-to-r from-secondary-500 to-secondary-600 text-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-secondary-500/20 border-none px-8 py-6 rounded-2xl font-black text-lg">
                                Get Started Now
                            </Button>
                        </a>
                    </div>
                    <div className=" flex  flex-row justify-evenly  gap-2 items-center p-16">
                        <CTAItem3LandItem number="01" title="Connect & Verify" description="Onboard your properties and verify ownership through our secure on-chain protocol. Connect your preferred Solana wallet in seconds." />
                        <CTAItem3LandItem number="02" title="Setup Lease Terms" description="Define monthly rent, security deposits, and payment windows. Our smart contracts generate a custom payment vault for each unit." />
                        <CTAItem3LandItem number="03" title="Automate & Scale" description="Invite tenants to the portal. Once authorized, rent is pulled automatically every month and deposited directly into your wallet." />
                    </div>
                </div>

            </motion.div>
        </div>
    );
}

function CTAItem3LandItem({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <motion.div className=" flex flex-col gap-2 bg-auth-navy items-start justify-center">

            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                    <h3 className="text-sol-emerald">{number}</h3>
                </div>
                <div>
                    <h5 className="text-surface-primary">{title}</h5>
                </div>
            </div>
            <p className="text-surface-tertiary">{description}</p>

        </motion.div>
    );
}
