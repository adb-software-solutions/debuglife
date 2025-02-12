// src/app/dashboard/page.tsx
"use client";

import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        Welcome to your admin dashboard. More widgets and functionality will be
        added here soon.
      </p>
    </div>
  );
};

export default DashboardPage;
