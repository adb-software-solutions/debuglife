import type {Metadata, Viewport} from "next";
import {Providers} from "./providers";
import { Suspense } from "react";
import Analytics from "@/components/gtmComponent";
import { GoogleAdsenseComponent } from "@/components/googleAdsenseComponent";

import "./globals.css";

export const metadata: Metadata = {
    title: "Epic Bargains And Deals",
    description:
        "Epic Bargains And Deals is a website that helps you find the best deals on Amazon UK, and other retailers.",
    authors: [{name: "Epic Bargains And Deals"}],
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
    applicationName: "Epic Bargains And Deals",
    appleWebApp: {
        title: "Epic Bargains And Deals",
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
                <GoogleAdsenseComponent />
            </head>
            <body className="h-full bg-white">
                <Providers>
                    {children}
                </Providers>
                <Suspense fallback={null}>
                    <Analytics />
                </Suspense>
            </body>
        </html>
    );
}
