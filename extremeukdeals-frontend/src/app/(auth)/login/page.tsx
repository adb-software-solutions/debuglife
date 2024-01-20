"use client"

import Image from "next/image";
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";


const LOGIN_USER = gql`
mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      status
      message
      success
    }
  }
`;

const USER_AUTHENTICATED_QUERY = gql`
query UserAuthenticated {
    isAuthenticated
    primaryEbayAccount {
        id
    }
    ebayAccountsCanAccess {
        id
        isDefault
    }
  }
`;

export default function LoginPage() {
    const router = useRouter()
    const [loginUser, { loading, error, data }] = useMutation(LOGIN_USER);
    const { loading: loadingUserAuthenticated, error: errorUserAuthenticated, data: dataUserAuthenticated } = useQuery(USER_AUTHENTICATED_QUERY);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Type assertion to inform TypeScript about the form structure
        const form = e.currentTarget;
        const emailInput = form.elements.namedItem("email") as HTMLInputElement;
        const passwordInput = form.elements.namedItem("password") as HTMLInputElement;

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
          const { data } = await loginUser({
            variables: { email: email, password: password }
          });

          if (data.loginUser.success) {
            console.log("Login success:", data.loginUser.user);

            // Find the primary ebay account
            const primaryEbayAccount = data.primaryEbayAccount;

            // If a primary realm is found, extract the id from the realm
            if (primaryEbayAccount) {
              const primaryEbayAccountId = primaryEbayAccount.id;
              console.log("Primary ebay account found:", primaryEbayAccountId);


              // Redirect to a path using the extracted realmId. Modify the path as per your requirement.
                router.push(`/dashboard/${primaryEbayAccountId}`);

            } else {
                router.push('/ebay-auth')

            }

          } else {
            // Handle error message - data.loginuser.message
          }
        } catch (err) {
          console.error("Login error:", err);
        }
      };

      // Check if user is logged in already and redirect to dashboard
        if (!loadingUserAuthenticated && !errorUserAuthenticated) {
            if (dataUserAuthenticated.isAuthenticated) {
            // User is logged in
                // Check if user has access to any ebay accounts
                if (dataUserAuthenticated.ebayAccountsCanAccess.length === 0) {
                    // Redirect to ebay auth page
                    router.push('/ebay-auth')
                } else {
                    // Redirect to dashboard
                    router.push(`/dashboard/${dataUserAuthenticated.primaryEbayAccount.id}}`);
                }
            }
        }


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Image
                    className="mx-auto h-10 w-auto"
                    src="/logo.svg"
                    alt="Your Company"
                    height={50}
                    width={180}
                    priority={true}
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-white"
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
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-white"
                            >
                                Password
                            </label>
                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-semibold text-brand hover:text-brand"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-brand px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-400">
                    Not a member?{" "}
                    <a
                        href="#"
                        className="font-semibold leading-6 text-brand hover:text-brand"
                    >
                        Start a 14 day free trial
                    </a>
                </p>
            </div>
        </div>
    );
}
