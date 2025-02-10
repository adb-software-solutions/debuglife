"use client";

import {getApiUrl} from "@/lib/getApi";
import {CategoryType} from "@/types/categories";
import LatestDealsSection from "@/components/frontend/categories/LatestDealsSection";
import HeroSectionComponent from "@/components/frontend/categories/HeroSection";
import {useParams, useRouter} from "next/navigation";
import {useEffect} from "react";
import {useState} from "react";
import Script from "next/script";

async function getProductsForCategory(id: string) {
    const res = await fetch(
        getApiUrl(
            `/shop-api/shop/affiliate_categories/${id}/affiliate_products/`,
        ),
        {
            next: {
                revalidate: 600,
            },
        },
    );
    const products = await res.json();
    return products.results;
}

async function getCategoryDetails(id: string) {
    const res = await fetch(
        getApiUrl(`/shop-api/shop/affiliate_categories/${id}`),
        {
            next: {
                revalidate: 600,
            },
        },
    );
    const category = await res.json();
    return category;
}

export default function CategoryPage() {
    const {id} = useParams<{id: string}>();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState<CategoryType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProducts = await getProductsForCategory(id);
                const fetchedCategory = await getCategoryDetails(id);

                if (fetchedCategory) {
                    setCategory(fetchedCategory);
                    setProducts(fetchedProducts);
                } else {
                    throw new Error("Category not found");
                }
            } catch (error) {
                console.error(error);
                router.push("/not-found");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (loading) {
        return <div>Loading...</div>; // Or any other loading indicator
    }

    return (
        <>
            <HeroSectionComponent
                category_name={category?.category_name ?? ""}
            />
            <Script
                async
                data-cfasync="false"
                src="//pl22433154.profitablegatecpm.com/9f8881d2e2497ad2779d1ae60bb07973/invoke.js"
            />
            <div id="container-9f8881d2e2497ad2779d1ae60bb07973"></div>
            <LatestDealsSection products={products} />
        </>
    );
}

export const dynamic = "force-dynamic";
