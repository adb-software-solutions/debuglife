"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import LogoComponent from "@/components/common/logo/LogoComponent";

const Sidebar = () => {
    const pathname = usePathname();

    // Helper function to compute class names using sky-300 for active/hover states.
    const navItemClass = (href: string): string =>
        `block p-2 rounded hover:bg-sky-100 dark:hover:bg-sky-800 ${
            pathname.startsWith(href)
                ? "bg-sky-300 text-slate-900"
                : "text-gray-700 dark:text-slate-300"
        }`;

    return (
        <aside className="h-full w-64 border-r border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-6">
                <LogoComponent className="mx-auto h-12 w-auto" />
            </div>
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link
                            href="/dashboard"
                            className={navItemClass("/dashboard")}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/posts"
                            className={navItemClass("/dashboard/posts")}
                        >
                            Posts
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/categories"
                            className={navItemClass("/dashboard/categories")}
                        >
                            Categories
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/tags"
                            className={navItemClass("/dashboard/tags")}
                        >
                            Tags
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/authors"
                            className={navItemClass("/dashboard/authors")}
                        >
                            Authors
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/gallery"
                            className={navItemClass("/dashboard/gallery")}
                        >
                            Gallery
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
