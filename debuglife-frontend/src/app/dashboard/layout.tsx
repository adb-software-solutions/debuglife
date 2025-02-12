// src/app/dashboard/layout.tsx
"use client";

import { ReactNode } from "react";
import AuthGuard from "@/guards/AuthGuard";
import Navbar from "@/components/cms/navigation/NavBar";
import Sidebar from "@/components/cms/navigation/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-4 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
