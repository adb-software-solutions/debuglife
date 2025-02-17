import type {Metadata, Viewport} from "next";
import {Providers} from "./providers";
import { Suspense } from "react";
import Analytics from "@/components/common/gtm/gtmComponent";
import { GoogleAdsenseComponent } from "@/components/common/ads/googleAdsenseComponent";
import { AuthProvider } from "@/context/AuthContext";

import "./globals.css";

export const metadata: Metadata = {
    title: "DebugLife",
    description:
        "DebugLife is a blog about software development, programming, and technology. Wr provide tutorials, tips, and tricks on various programming languages and technologies as well as reviews on all things tech.",
    authors: [
        {name: "DebugLife"},
        {name: "Adam Birds"},
    ],
    manifest: "/site.webmanifest",
    icons: {
        icon: [
            {
                url: "/favicon-32x32.png",
                type: "image/png",
                rel: "icon",
                sizes: "32x32",
            },
            {
                url: "/favicon-16x16.png",
                type: "image/png",
                rel: "icon",
                sizes: "16x16",
            },
        ],
        apple: {
            url: "/apple-touch-icon.png",
            type: "image/png",
            rel: "apple-touch-icon",
            sizes: "180x180",
        },
    },
    applicationName: "DebugLife",
    appleWebApp: {
        title: "DebugLife",
    },
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <head>
                <meta httpEquiv="Permissions-Policy" content="picture-in-picture '*'"/>
                <link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>
                {/* <GoogleAdsenseComponent /> */}
            </head>
            <body className="h-full bg-white dark:bg-slate-900">
                <Providers>
                    <AuthProvider>
                    {children}
                    </AuthProvider>
                </Providers>
                <Suspense fallback={null}>
                    <Analytics />
                </Suspense>
            </body>
        </html>
    );
}
