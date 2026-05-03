"use client"
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 bg-background-100 rounded-2xl transition-all duration-200 hover:bg-background-200"
            >
                <span className="text-left font-bold text-text-900 text-lg">
                    {question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-text-900 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 text-text-600 leading-relaxed text-md">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const CommonQuestions = () => {
    const faqs = [
        {
            question: "Is my USDC safe in the protocol?",
            answer: "Yes. SolRent uses audited smart contracts that act as simple non-custodial conduits. We never hold your funds; they move directly from the tenant's authorized vault to your wallet."
        },
        {
            question: "What happens if a tenant has insufficient funds?",
            answer: "The protocol will attempt to retry the collection at set intervals. Landlords receive instant notifications via the dashboard, and automated late-fee logic can be triggered based on your specific smart contract settings."
        },
        {
            question: "Do I need to be a crypto expert to use this?",
            answer: "Not at all. SolRent is designed with a 'Web2 feel' for a Web3 world. Our interface handles the blockchain complexity in the background, allowing you to manage rent collection as easily as any traditional banking app."
        }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 font-sans">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-text-900 mb-4">
                    Common Questions
                </h2>
                <p className="text-text-500 text-lg">
                    Everything you need to know about automated rent collection.
                </p>
            </div>

            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </div>
    );
};

export default CommonQuestions;