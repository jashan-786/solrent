"use client"
import { AddPropertyModal } from "@/components/modals/addpropertymodal";
import { CTAEmptyStateProps } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Plus, Store } from "lucide-react";
import { useState } from "react";

const CTAEmptyState = ({
    title,
    description,
    buttonText,
    onAction,
    icon,

}: CTAEmptyStateProps) => {

    return (
        <Card className="border-none shadow-sm bg-surface-primary rounded-3xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer  max-h-[220px] p-0 m-0" onClick={onAction}>
            <CardContent className=" flex flex-col items-center justify-center text-center h-full m-0 p-0">

                <div className="flex items-center justify-center pt-6 w-24 h-24 ">
                    
                    <div className=" border-2 border-dashed border-sky-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex items-center justify-center w-20 h-20 bg-background-grey rounded-full">
                        {icon ? (
                            icon
                        ) : (
                            <Store className="w-10 h-10 text-auth-navy" strokeWidth={1.5} />
                        )}

                    </div>
                </div>

                <small className="text-text-grey  max-w-md leading-relaxed">
                    {description}
                </small>
                <AddPropertyModal />

            </CardContent>
        </Card>
    );
};

export default function CTAEmptyStateCompnent() {

    return <CTAEmptyState
        title="Add New Property"
        description="Register a new institutional asset to your portfolio."
        buttonText="Get Started"
        onAction={() => { }} 

    />
}