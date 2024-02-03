import Navbar from "@/components/common/frontend/NavBar";
import FooterComponent from "@/components/common/frontend/footer/Footer";
import HeroSectionComponent from "@/components/frontend/home/HeroSection";
import LatestDealsSection from "@/components/frontend/home/LatestDealsSection";
import {footerNavigation, footerSocial} from "@/fixtures/footerData";

const navigation = [
    {title: "Home", href: "/", current: true},
    {title: "Recent Deals", href: "/recent-deals", current: false},
    {title: "Deal Categories", href: "/deal-categories", current: false},
    {title: "Community", href: "/community", current: false},
];

function getBaseUrl() {
    // Check if running on the server
    if (typeof window === "undefined") {
        // Running on server - use Docker container name
        return "http://extremeukdeals-backend:8000";
    } else {
        // Running on client - use specific domain
        return "https://extremeukdeals.com";
    }
}

// Function to get the full API URL by appending the API path
function getApiUrl(apiPath: string): string {
    const baseUrl = getBaseUrl(); // Get the base URL dynamically
    return `${baseUrl}${apiPath}`; // Construct the full API URL
}

async function getProducts() {
    const res = await fetch(
        "http://extremeukdeals-backend:8000/api/shop/affiliate_products/",
        {
            cache: "no-cache",
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
