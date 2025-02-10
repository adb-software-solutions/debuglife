import Image from "next/image";
import Link from "next/link";

import Icon from "@/components/common/Icon";
import { footerSocial } from "@/fixtures/footerData";

type SocialItem = {
    name: string;
    href: string;
    icon: string;
};

export default function NotFound() {
    const social: SocialItem[] = footerSocial;

    return (
        <>
            <div className="flex min-h-full flex-col bg-gray-900 pb-12 pt-16">
                <main className="mx-auto flex w-full max-w-7xl grow flex-col justify-center px-6 lg:px-8">
                    <div className="flex shrink-0 justify-center">
                        <Link href="/" className="inline-flex">
                            <span className="sr-only">Epic Bargains And Deals</span>
                            <Image
                                className="h-12 w-auto"
                                src="/logo.svg"
                                alt=""
                                height={40}
                                width={150}
                                priority={true}
                            />
                        </Link>
                    </div>
                    <div className="py-16">
                        <div className="text-center">
                            <p className="text-brand text-base font-semibold">
                                404
                            </p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Page not found.
                            </h1>
                            <p className="mt-2 text-base text-white">
                                Sorry, we couldn’t find the page you’re looking
                                for.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="text-brand hover:text-brand text-base font-medium"
                                >
                                    Go back home
                                    <span aria-hidden="true"> &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="mx-auto w-full max-w-7xl shrink-0 px-6 lg:px-8">
                    <nav className="flex justify-center space-x-4">
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-500 hover:text-gray-600"
                        >
                            Contact Support
                        </Link>
                    </nav>
                    {/* Social Media Icons */}
                    <div className="mt-8 flex justify-center space-x-6">
                        {social.map((item) => (
                            <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <Icon iconName={item.icon} className="h-6 w-6" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </footer>
            </div>
        </>
    );
}
