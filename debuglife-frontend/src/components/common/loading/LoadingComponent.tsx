import React from "react";

const CircularLoader: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900">
      <div className="relative h-12 w-12">
        {/* Static circle background */}
        <div className="absolute inset-0 rounded-full border-t-4 border-gray-300"></div>
        {/* Animated spinner using sky accent */}
        <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-sky-300 duration-[1500ms]"></div>
      </div>
    </div>
  );
};

export default CircularLoader;
