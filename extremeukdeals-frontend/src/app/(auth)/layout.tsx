"use client"

import { useEffect } from "react";

export default function MainLayout({children}: {children: React.ReactNode}) {
    useEffect(() => {
        document.body.classList.add('dark:bg-gray-900');

        return () => {
            document.body.classList.remove('dark:bg-gray-900')
        };
    }, []);

    return (
        <>
            {children}
        </>
    );
}
