"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HeroSectionComponent from "@/components/frontend/home/HeroSection"; // Adjust the import path as necessary
import LatestDealsSection from "@/components/frontend/home/LatestDealsSection"; // Adjust the import path as necessary
import { ProductType } from "@/types/product"; // Assuming this is the correct import path
import Script from "next/script";

export default function Home() {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const loader = useRef<HTMLDivElement>(null);

    const fetchProducts = useCallback(async (page: number) => {
        // Adjust the API endpoint as necessary
        const response = await fetch(`/api/shop/products?page=${page}`);
        const data = await response.json();
        setProducts(prev => [...prev, ...data.results]);
        setHasMore(data.next !== null); // This assumes 'next' is a way your API indicates more data
    }, []);

    // Function to handle search results
    const handleSearchResults = useCallback((results: ProductType[]) => {
        setProducts(results);
        setPage(1);
        setHasMore(false);
        setIsSearching(true);
    }, []);

    // Intersection Observer setup
    useEffect(() => {
        if (isSearching) return; // Skip setting up the observer if in search mode

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }, {
            root: null,
            rootMargin: "20px",
            threshold: 1.0,
        });

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isSearching]); // Ensures effect is properly applied based on hasMore and isSearching states

    // Fetching next page of products
    useEffect(() => {
        if (isSearching) return; // Skip fetching next page if in search mode

        fetchProducts(page);
    }, [page, fetchProducts, isSearching]); // Ensures fetching logic respects the current search state

    return (
        <div>
            <HeroSectionComponent setProducts={handleSearchResults} />
            <Script
                async
                data-cfasync="false"
                src="//pl22433154.profitablegatecpm.com/9f8881d2e2497ad2779d1ae60bb07973/invoke.js"
            />
            <div id="container-9f8881d2e2497ad2779d1ae60bb07973"></div>
            <LatestDealsSection products={products} />
            {!isSearching && hasMore && <div ref={loader}>Loading more...</div>}
        </div>
    );
}
