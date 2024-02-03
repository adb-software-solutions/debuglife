import Image from "next/image";
import Link from "next/link";

import {
    SiInstagram,
    SiTwitter,
    SiLinkedin,
    SiGithub,
} from "@icons-pack/react-simple-icons";

export default function NotFound() {
    return (
        <>
            <div className="flex min-h-full flex-col bg-gray-900 pb-12 pt-16">
                <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-6 lg:px-8">
                    <div className="flex flex-shrink-0 justify-center">
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
                <footer className="mx-auto w-full max-w-7xl flex-shrink-0 px-6 lg:px-8">
                    <nav className="flex justify-center space-x-4">
                        <a
                            href="#"
                            className="text-sm font-medium text-gray-500 hover:text-gray-600"
                        >
                            Contact Support
                        </a>
                    </nav>
                    {/* Social Media Icons */}
                    <div className="mt-8 flex justify-center space-x-6">
                        <a
                            href="https://instagram.com/VastDesk"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Facebook</span>
                            <SiInstagram className="h-6 w-6" />
                        </a>
                        <a
                            href="https://twitter.com/VastDesk"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Twitter</span>
                            <SiTwitter className="h-6 w-6" />
                        </a>
                        <a
                            href="https://linkedin.com/company/VastDesk"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">LinkedIn</span>
                            <SiLinkedin className="h-6 w-6" />
                        </a>
                        <a
                            href="https://github.com/VastDesk"
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">GitHub</span>
                            <SiGithub className="h-6 w-6" />
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
