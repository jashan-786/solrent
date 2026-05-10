"use client"
import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
    const tabs = [
        { name: 'Upcoming' },
        { name: 'Completed' },
        { name: 'Failed' },
        { name: 'Receipts / NFTs' }
    ];

    return (
        <div className="w-full font-sans">
            <div className="flex items-center gap-8 border-b border-gray-100 px-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.name;

                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className="relative py-4 group outline-none"
                        >
                            <span className={`text-sm font-bold transition-colors duration-200 ${isActive ? 'text-[#1a1c1e]' : 'text-[#6b7280] hover:text-[#1a1c1e]'
                                }`}>
                                {tab.name}
                            </span>

                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6ee7b7] rounded-full" />
                            )}

                            {!isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gray-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
