// src/app/dashboard/layout.tsx
"use client";

import {ReactNode} from "react";
import AuthGuard from "@/guards/AuthGuard";
import Navbar from "@/components/cms/navigation/NavBar";
import Sidebar from "@/components/cms/navigation/Sidebar";
import {MilkdownProvider} from "@milkdown/react";
import {ProsemirrorAdapterProvider} from "@prosemirror-adapter/react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({children}: DashboardLayoutProps) => {
    return (
        <AuthGuard>
            <MilkdownProvider>
                <ProsemirrorAdapterProvider>
                    <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex min-w-0 flex-1 flex-col">
                            <Navbar />
                            <main className="overflow-auto p-4">
                                {/* Wrap table in an overflow container */}
                                <div className="overflow-x-auto">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </ProsemirrorAdapterProvider>
            </MilkdownProvider>
        </AuthGuard>
    );
};

export default DashboardLayout;
