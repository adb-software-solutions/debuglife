"use client";

// DashboardLayout.tsx
import React, {useRef, useState, useEffect, ReactNode} from "react";
import Navbar from "@/components/cms/navigation/NavBar";
import Sidebar from "@/components/cms/navigation/Sidebar";
import AuthGuard from "@/guards/AuthGuard";
import {MilkdownProvider} from "@milkdown/react";
import {ProsemirrorAdapterProvider} from "@prosemirror-adapter/react";

const DashboardTemplate = ({children}: {children: ReactNode}) => {
    const [navbarHeight, setNavbarHeight] = useState(0);

    const handleNavbarRef = (node: HTMLDivElement | null) => {
        if (node) {
            const {height} = node.getBoundingClientRect();
            setNavbarHeight(height);
        }
    };

    return (
        <AuthGuard>
            <MilkdownProvider>
                <ProsemirrorAdapterProvider>
                    <div
                        className="flex h-screen"
                        style={
                            {
                                "--total-subtraction": `${navbarHeight}px`,
                            } as React.CSSProperties
                        }
                    >
                        <Sidebar />
                        <div className="flex min-w-0 flex-1 flex-col">
                            <Navbar ref={handleNavbarRef} />
                            <main className="overflow-auto">{children}</main>
                        </div>
                    </div>
                </ProsemirrorAdapterProvider>
            </MilkdownProvider>
        </AuthGuard>
    );
};

export default DashboardTemplate;
