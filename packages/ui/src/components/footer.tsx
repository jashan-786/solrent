import React from 'react';
import { Globe, MessageCircle, Home, Zap } from 'lucide-react';
import { Button } from './ui/button';

export const Footer = () => {
    return (
        <footer className="w-full bg-primary-950 text-white pt-24 pb-12 px-6 md:px-12 font-sans border-t border-primary-900">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">

                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg">
                            <Home className="h-5 w-5 text-white absolute z-10" />
                            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-primary-950 rounded-full flex items-center justify-center border border-primary-900 shadow-sm">
                                <Zap className="h-3.5 w-3.5 text-secondary-500 fill-secondary-500" />
                            </div>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white leading-none">
                            Sol<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-secondary-500">Rent</span>
                        </span>
                    </div>
                    <p className="text-primary-200/60 text-sm leading-relaxed">
                        The institutional-grade protocol for stablecoin rent automation on Solana. Transforming real estate with Proof of Rent NFTs.
                    </p>
                    <div className="flex items-center gap-3">

                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg bg-primary-900/40 text-primary-200 hover:text-white hover:bg-primary-800 transition-all border border-primary-800/50">
                            <MessageCircle size={18} />
                        </Button>
                    </div>
                </div>

                {/* Product Column */}
                <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Product</h4>
                    <nav className="flex flex-col gap-4 text-primary-200/60 text-sm font-bold">
                        <a href="/#features" className="hover:text-secondary-500 transition-colors">Features</a>
                        <a href="/#how-it-works" className="hover:text-secondary-500 transition-colors">How it Works</a>
                        <a href="/#faq" className="hover:text-secondary-500 transition-colors">FAQs</a>
                        <a href="/register" className="hover:text-secondary-500 transition-colors text-secondary-500 font-black">Get Started</a>
                    </nav>
                </div>

                {/* Legal Column */}
                <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Legal</h4>
                    <nav className="flex flex-col gap-4 text-primary-200/60 text-sm font-bold">
                        <a href="#" className="hover:text-secondary-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-secondary-500 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-secondary-500 transition-colors">Protocol Security</a>
                    </nav>
                </div>

                {/* Newsletter Column */}
                <div className="flex flex-col gap-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Status</h4>
                    <div className="bg-primary-900/40 border border-primary-800/50 rounded-2xl p-4 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-secondary-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-xs font-bold text-primary-200">Mainnet Beta Live</span>
                    </div>
                    <p className="text-[10px] text-primary-200/40 font-medium leading-relaxed uppercase tracking-widest">
                        SolRent is a non-custodial protocol. Users interact directly with Solana smart contracts.
                    </p>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto pt-12 border-t border-primary-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-primary-200/40 text-[11px] font-bold uppercase tracking-widest">
                    © 2026 SolRent Protocol. Built for the Solana Global Hackathon.
                </p>
                <div className="flex items-center gap-2 text-primary-200/40 text-[11px] font-bold uppercase tracking-widest">
                    <Globe size={12} />
                    <span>Global Network Status: Optimal</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;