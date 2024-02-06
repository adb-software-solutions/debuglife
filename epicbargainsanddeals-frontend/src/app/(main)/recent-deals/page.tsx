import HeroSectionComponent from "@/components/frontend/latest-deals/HeroSection";
import LatestDealsSection from "@/components/frontend/latest-deals/LatestDealsSection";
import { getApiUrl } from "@/lib/getApi";

async function getProducts() {
    const res = await fetch(
        getApiUrl("/shop-api/shop/affiliate_products"),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const products = await res.json();
    return products.results;
}

export default async function RecentDealsPage() {
    const products = await getProducts();

    return (
        <>
            <HeroSectionComponent />
            <LatestDealsSection products={products} />
        </>
    );
}

export const dynamic = "force-dynamic";