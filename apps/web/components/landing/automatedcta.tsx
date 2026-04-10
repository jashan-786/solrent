import React from 'react';
import { Button } from '@repo/ui/components/ui/button';

const AutomatedLedgerCTA = () => {
    return (
        <div className="w-full flex justify-center py-20 font-sans">
            <div className="max-w-7xl w-full mx-4 md:mx-auto bg-[#dafff0] rounded-[48px] p-16 md:p-24 shadow-inner flex flex-col items-center text-center">

                <h2 className=" font-extrabold text-[#111111] leading-tight mb-8">
                    Ready to automate your ledger?
                </h2>

                <p className="max-w-3xl text-lg md:text-xl text-[#5c6168] leading-relaxed mb-16">
                    Join hundreds of property owners who have already saved thousands in processing fees.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

                    <Button
                        className="w-full sm:w-auto h-auto text-lg px-10 py-5 font-bold rounded-2xl bg-[#000000] text-white hover:bg-neutral-800 transition-all duration-300"
                    >
                        Connect Wallet
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full sm:w-auto h-auto text-lg px-10 py-5 font-bold rounded-2xl bg-white border-none shadow-[0_4px_12px_0px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow duration-300"
                    >
                        Contact Sales
                    </Button>

                </div>
            </div>
        </div>
    );
};

export default AutomatedLedgerCTA;