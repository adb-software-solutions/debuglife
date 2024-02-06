import HeroSectionComponent from "@/components/frontend/latest-deals/HeroSection";
import CategoriesSection from "@/components/frontend/deal-categories/CategoriesSection";
import { getApiUrl } from "@/lib/getApi";

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
            <CategoriesSection categories={categories} />
        </>
    );
}

export const dynamic = "force-dynamic";