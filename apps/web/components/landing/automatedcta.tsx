import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';

const AutomatedLedgerCTA = () => {
    return (
        <div className="w-full flex justify-center py-24 font-sans bg-background-50">
            <div className="max-w-7xl w-full mx-4 md:mx-auto bg-primary-950 rounded-[48px] p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>

                <h2 className="font-black text-white text-4xl md:text-6xl leading-tight mb-8 z-10">
                    Ready to automate your ledger?
                </h2>

                <p className="max-w-2xl text-lg md:text-xl text-primary-200/80 leading-relaxed mb-16 z-10">
                    Join hundreds of property owners who have already saved thousands in processing fees by moving their rental operations on-chain.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full justify-center">
                    <a href="/register" className="w-full sm:w-auto">
                        <Button
                            className="w-full h-auto text-lg px-12 py-6 font-black rounded-2xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 border-none flex items-center gap-3"
                        >
                            Connect Wallet <ArrowRight className="h-5 w-5" />
                        </Button>
                    </a>

                    <a href="/register" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full h-auto text-lg px-12 py-6 font-black rounded-2xl bg-transparent border-2 border-primary-800 text-white hover:bg-primary-900 hover:border-primary-700 transition-all duration-300 flex items-center gap-3"
                        >
                            <MessageSquare className="h-5 w-5" /> Contact Sales
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AutomatedLedgerCTA;