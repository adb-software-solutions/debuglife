"use client";
import {setCookie, hasCookie} from "cookies-next";
import {useState, useEffect} from "react";

export const CookieConsent = () => {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // If no consent cookie is present, show the consent popup
        if (!hasCookie("consent")) {
            setShowConsent(true);
        }
    }, []);

    const acceptConsent = () => {
        // When user accepts consent, hide the popup and set a consent cookie
        setShowConsent(false);
        setCookie("consent", "true");

        // Trigger GTM script load
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("updateGTMConsent"));
        }
    };
    const declineConsent = () => {
        // When user declines the consent, simply hide the popup
        setShowConsent(false);
    };

    if (!showConsent) {
        return null;
    }

    return (
        <div className="min-w-xs py-15 fixed bottom-0 left-1/2 m-4 ml-0 flex w-full max-w-2xl -translate-x-1/2 transform flex-col items-center justify-center bg-blue-500 p-8 text-white sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/3">
            <div>
                <p>
                    We use some <strong>standard analytics packages</strong> to
                    understand general user behaviour, so we can figure out how
                    to improve our content. This involves some cookies. Are you
                    OK with this?
                </p>
            </div>
            <div className="mt-2 flex">
                <button
                    onClick={acceptConsent}
                    className="mr-2 rounded bg-white px-4 py-2 text-blue-500"
                >
                    Accept
                </button>
                <button
                    onClick={declineConsent}
                    className="rounded bg-white px-4 py-2 text-blue-500"
                >
                    Decline
                </button>
            </div>
        </div>
    );
};
