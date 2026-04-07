"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { Menu, X, Wallet } from "lucide-react";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative">
            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-1000 flex transition-all duration-300 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer (Slide in from left) */}
                <div className={`relative w-64 max-w-[80vw] h-screen bg-white shadow-2xl px-6 py-8 flex flex-col gap-8 transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex justify-between items-center border-b pb-4">
                        <h4 className="text-sol-indigo m-0 font-bold">SolRent</h4>
                        <button className="p-2 -mr-2 text-slate-600 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                            <X size={28} />
                        </button>
                    </div>

                    <ul className="flex flex-col gap-6 m-0 mt-4 list-none p-0">
                        <li className="font-semibold text-xl">
                            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-sol-emerald">FEATURES</Link>
                        </li>
                        <li className="font-semibold text-xl">
                            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block hover:text-sol-emerald">HOW IT WORKS</Link>
                        </li>
                        <li className="font-semibold text-xl">
                            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block hover:text-sol-emerald">FAQ</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <header className="sticky top-0 z-50 w-full bg-surface-primary border-b border-gray-100 shadow-sm">
                <div className="px-4 md:px-8 py-3">
                    <nav className="flex flex-row justify-between items-center">
                        {/* Left: Burger & Logo */}
                        <div className="flex flex-row items-center gap-4">
                            <button className="p-2 -ml-2 text-slate-700 hover:bg-gray-100 rounded-lg cursor-pointer md:hidden" onClick={() => setIsMenuOpen(true)}>
                                <Menu size={28} />
                            </button>
                            <h4 className="text-sol-indigo m-0 font-bold text-xl tracking-tight">SolRent</h4>
                        </div>

                        {/* Center: Desktop Navigation */}
                        <ul className="hidden md:flex flex-1 gap-8 flex-row justify-center items-center m-0 list-none p-0">
                            <li className="hover:text-sol-emerald font-semibold transition-colors"><Link href="/">FEATURES</Link></li>
                            <li className="hover:text-sol-emerald font-semibold transition-colors"><Link href="/about">HOW IT WORKS</Link></li>
                            <li className="hover:text-sol-emerald font-semibold transition-colors"><Link href="/contact">FAQ</Link></li>
                        </ul>

                        {/* Right: Connect Button */}
                        <div className="flex flex-row items-center">
                            <Button className="font-bold bg-auth-navy text-white hover:bg-slate-800 transition-all rounded-xl px-6 h-10 flex items-center">
                                <Wallet size={20} className="md:hidden" />
                                <span className="hidden md:inline">Connect Wallet</span>
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>
        </div>
    );
}