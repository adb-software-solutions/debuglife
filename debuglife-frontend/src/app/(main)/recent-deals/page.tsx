import HeroSectionComponent from "@/components/frontend/latest-deals/HeroSection";
import LatestDealsSection from "@/components/frontend/latest-deals/LatestDealsSection";
import { getApiUrl } from "@/lib/getApi";
import Script from "next/script";

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