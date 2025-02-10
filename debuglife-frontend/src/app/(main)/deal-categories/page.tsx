import HeroSectionComponent from "@/components/frontend/latest-deals/HeroSection";
import CategoriesSection from "@/components/frontend/deal-categories/CategoriesSection";
import { getApiUrl } from "@/lib/getApi";
import Script from "next/script";

async function getCategories() {
    const res = await fetch(
        getApiUrl("/shop-api/shop/affiliate_categories"),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const categories = await res.json();
    return categories.results;
}

export default async function RecentDealsPage() {
    const categories = await getCategories();

    return (
        <>
            <HeroSectionComponent />
            <Script
                async
                data-cfasync="false"
                src="//pl22433154.profitablegatecpm.com/9f8881d2e2497ad2779d1ae60bb07973/invoke.js"
            />
            <div id="container-9f8881d2e2497ad2779d1ae60bb07973"></div>
            <CategoriesSection categories={categories} />
        </>
    );
}

export const dynamic = "force-dynamic";