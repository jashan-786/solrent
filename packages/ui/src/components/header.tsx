"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Menu, X, Wallet, Home, Zap } from "lucide-react";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative">
            <div className={`fixed inset-0 z-[1000] flex transition-all duration-300 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />

                <div className={`relative w-64 max-w-[80vw] h-screen bg-background-50 shadow-2xl px-6 py-8 flex flex-col gap-8 transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex justify-between items-center border-b border-background-200 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
                                <Home className="h-4 w-4 text-white absolute z-10" />
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-background-50 rounded-full flex items-center justify-center">
                                    <Zap className="h-2 w-2 text-secondary-500 fill-secondary-500" />
                                </div>
                            </div>
                            <span className="text-lg font-black tracking-tighter text-text-950 leading-none">
                                Sol<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-secondary-500">Rent</span>
                            </span>
                        </div>
                        <button className="p-2 -mr-2 text-text-500 hover:text-text-900 cursor-pointer transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <ul className="flex flex-col gap-6 m-0 mt-4 list-none p-0">
                        <li className="font-semibold text-lg text-text-700">
                            <a href="/#features" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent-500 transition-colors">FEATURES</a>
                        </li>
                        <li className="font-semibold text-lg text-text-700">
                            <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent-500 transition-colors">HOW IT WORKS</a>
                        </li>
                        <li className="font-semibold text-lg text-text-700">
                            <a href="/register" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent-500 transition-colors">CONNECT</a>
                        </li>
                    </ul>
                </div>
            </div>

            <header className="sticky top-0 z-50 w-full bg-background-50/80 backdrop-blur-lg border-b border-background-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                    <nav className="flex flex-row justify-between items-center">
                        <div className="flex flex-row items-center gap-4">
                            <button className="p-2 -ml-2 text-text-700 hover:bg-background-100 rounded-lg cursor-pointer md:hidden transition-colors" onClick={() => setIsMenuOpen(true)}>
                                <Menu size={24} />
                            </button>
                            
                            <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
                                <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-md transform group-hover:scale-105 transition-all">
                                    <Home className="h-5 w-5 text-white absolute z-10" />
                                    <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-background-50 rounded-full flex items-center justify-center shadow-sm">
                                        <Zap className="h-3.5 w-3.5 text-secondary-500 fill-secondary-500" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black tracking-tighter text-text-950 leading-none">
                                        Sol<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-secondary-500">Rent</span>
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-text-400 mt-0.5">
                                        Web3 Estates
                                    </span>
                                </div>
                            </a>
                        </div>

                        <ul className="hidden md:flex flex-1 gap-10 flex-row justify-center items-center m-0 list-none p-0 text-text-600">
                            <li className="hover:text-accent-600 font-bold text-sm tracking-wide transition-colors"><a href="/#features">FEATURES</a></li>
                            <li className="hover:text-accent-600 font-bold text-sm tracking-wide transition-colors"><a href="/#how-it-works">HOW IT WORKS</a></li>
                            <li className="hover:text-accent-600 font-bold text-sm tracking-wide transition-colors"><a href="/#faq">FAQ</a></li>
                        </ul>

                        <div className="flex flex-row items-center">
                            <a href="/register">
                                <Button className="font-bold bg-primary-900 text-white hover:bg-primary-800 transition-all rounded-xl px-6 h-10 flex items-center shadow-md hover:shadow-lg">
                                    <Wallet size={18} className="md:hidden" />
                                    <span className="hidden md:inline">Connect Wallet</span>
                                </Button>
                            </a>
                        </div>
                    </nav>
                </div>
            </header>
        </div>
    );
}