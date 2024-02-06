"use client";

import Icon from "@/components/common/Icon";
import {useState} from "react";

interface Props {
    getSearchResults: (data: any) => void;
}

export default function SearchProducts({getSearchResults}: Props) {
    const [query, setQuery] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Redirect to the /search page with the search term as a query parameter
        const response = await fetch(
            `/eapi/shop/products/search?query=${query}`,
        );

        const data = await response.json();

        getSearchResults(data);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon
                    iconName="magnifying-glass-solid-20"
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                />
            </div>
            <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-brand focus:border-brand block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:outline-none focus:ring-1 sm:text-sm"
                placeholder="Search for deals"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-black"
            >
                Search
            </button>
        </form>
    );
}
