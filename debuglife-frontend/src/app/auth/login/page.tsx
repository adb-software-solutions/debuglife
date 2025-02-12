"use client";

import React, {useEffect, useState, FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/solid";
import {useAuth} from "@/context/AuthContext";
import LogoComponent from "@/components/common/logo/LogoComponent";
import CircularLoader from "@/components/common/loading/LoadingComponent";

const LoginPage: React.FC = () => {
    const router = useRouter();
    const {user, login, loading} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // If the user is already logged in, redirect them.
    useEffect(() => {
        if (user && !isRedirecting) {
            setIsRedirecting(true);
            router.push("/dashboard");
        }
    }, [user, router, isRedirecting]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = form.email.value;
        const password = form.password.value;
        setError(null);
        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        }
    };

    // Show a loader while authentication status is loading.
    if (loading) {
        return <CircularLoader />;
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center bg-white px-6 py-12 lg:px-8 dark:bg-slate-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <LogoComponent className="mx-auto h-20 w-auto" />
                <h2 className="mt-10 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
                        >
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border-0 bg-slate-100 py-1.5 text-gray-900 ring-1 shadow-sm ring-gray-300 ring-inset focus:ring-2 focus:ring-sky-300 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
                            >
                                Password
                            </label>
                            <div className="text-sm">
                                <Link
                                    href="/auth/reset-password"
                                    className="font-semibold text-sky-300 hover:text-sky-400"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <div className="relative mt-2">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md border-0 bg-slate-100 py-1.5 text-gray-900 ring-1 shadow-sm ring-gray-300 ring-inset focus:ring-2 focus:ring-sky-300 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-gray-600"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-center text-red-500">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-sky-300 px-3 py-1.5 text-sm leading-6 font-semibold text-gray-900 shadow-sm hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
