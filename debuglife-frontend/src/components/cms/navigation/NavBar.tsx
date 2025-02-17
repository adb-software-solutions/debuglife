import React, { forwardRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import InitialsComponent from "@/components/common/initials/InitialsComponent";

const Navbar = forwardRef<HTMLDivElement>((props, ref) => {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const userName = user?.firstName + " " + user?.lastName || "User";

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render the nav element regardless. If not mounted, hide inner content.
  return (
    <nav
      ref={ref}
      className="relative flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
    >
      {mounted ? (
        <>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded p-2 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-700"
            >
              <LightBulbIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.author?.avatar ? (
                    <img
                      src={user.author.avatar}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <InitialsComponent name={userName} />
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-slate-700">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => {
                            router.push("/dashboard/account");
                            setDropdownOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-600"
                        >
                          Account
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-600"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        // Even if not mounted, render something with a min-height.
        <div style={{ minHeight: "64px" }} />
      )}
    </nav>
  );
});

export default Navbar;