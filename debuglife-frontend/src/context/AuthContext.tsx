// src/context/AuthContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import {fetchWithCSRF} from "@/helpers/common/csrf";

// Define an interface for the optional author data.
export interface Author {
    avatar?: string; // URL to the avatar image
    bio?: string;
}

// Update the User interface to use camelCase.
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    author?: Author;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Refresh the current user information.
    const refreshUser = async () => {
        try {
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            );
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    // Transform API response keys from snake_case to camelCase.
                    const transformedUser: User = {
                        id: data.user.id,
                        email: data.user.email,
                        firstName: data.user.first_name, // API returns "first_name"
                        lastName: data.user.last_name, // API returns "last_name"
                        isStaff: data.user.is_staff, // API returns "is_staff"
                        author: data.user.author
                            ? {
                                  avatar: data.user.author.avatar, // Assuming API returns "avatar"
                                  bio: data.user.author.bio,
                              }
                            : undefined,
                    };
                    setUser(transformedUser);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetchWithCSRF(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            },
        );
        if (res.ok) {
            await refreshUser();
        } else {
            const errorData = await res.json();
            throw new Error(errorData.message || "Login failed");
        }
    };

    const logout = async () => {
        const res = await fetchWithCSRF(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        if (res.ok) {
            setUser(null);
        } else {
            throw new Error("Logout failed");
        }
    };

    return (
        <AuthContext.Provider
            value={{user, loading, login, logout, refreshUser}}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
