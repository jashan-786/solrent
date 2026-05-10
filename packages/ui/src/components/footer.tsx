import React from 'react';
import { Globe, Share2 } from 'lucide-react';
import { Button } from './ui/button';


export const Footer = () => {
    return (
        <footer className="w-full bg-[#0f141f] text-white py-12 px-6 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">

                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h2 className="text-2xl font-bold tracking-tight">The Editorial Ledger</h2>
                    <p className="text-[#6b7280] text-sm">
                        © 2024 The Editorial Ledger. Built on Solana.
                    </p>
                </div>

                <nav className="flex items-center gap-6 text-[#94a3b8] text-sm font-medium">
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Protocol</a>
                    <a href="#" className="hover:text-white transition-colors">Security</a>
                </nav>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-[#1e293b]/50 border-[#334155] hover:bg-[#334155] text-white w-10 h-10"
                    >
                        <Globe className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-[#1e293b]/50 border-[#334155] hover:bg-[#334155] text-white w-10 h-10"
                    >
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>

            </div>
        </footer>
    );
};

export default Footer;