// src/app/dashboard/layout.tsx
"use client";

import { ReactNode } from "react";
import AuthGuard from "@/guards/AuthGuard";
import Navbar from "@/components/cms/navigation/NavBar";
import Sidebar from "@/components/cms/navigation/Sidebar";
import { MilkdownProvider } from "@milkdown/react";
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <AuthGuard>
      <MilkdownProvider>
        <ProsemirrorAdapterProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-4 overflow-auto">{children}</main>
        </div>
      </div>
      </ProsemirrorAdapterProvider>
      </MilkdownProvider>
    </AuthGuard>
  );
};

export default DashboardLayout;
