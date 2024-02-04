import Navbar from "@/components/common/frontend/NavBar";
import FooterComponent from "@/components/common/frontend/footer/Footer";
import HeroSectionComponent from "@/components/frontend/home/HeroSection";
import LatestDealsSection from "@/components/frontend/home/LatestDealsSection";
import {footerNavigation, footerSocial} from "@/fixtures/footerData";
import {getApiUrl} from "@/lib/getApi";

const navigation = [
    {title: "Home", href: "/", current: true},
    {title: "Recent Deals", href: "/recent-deals", current: false},
    {title: "Deal Categories", href: "/deal-categories", current: false},
    {title: "Community", href: "/community", current: false},
];

async function getProducts() {
    const res = await fetch(
        getApiUrl("/api/shop/affiliate_products"),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const products = await res.json();
    return products.results;
}

export default async function Home() {
    const products = await getProducts();

    return (
        <div>
            <Navbar navigation={navigation} />

            <HeroSectionComponent />

            <LatestDealsSection products={products} />

            <FooterComponent
                navigation={footerNavigation}
                social={footerSocial}
            />
        </div>
    );
}

export const dynamic = 'force-dynamic';
