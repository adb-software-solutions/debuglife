import Navbar from "@/components/common/frontend/NavBar"
import FooterComponent from "@/components/common/frontend/footer/Footer"
import { footerNavigation, footerSocial } from "@/fixtures/footerData"
import { Suspense } from "react";

const navigation = [
    {title: "Home", href: "/", current: true},
    {title: "Recent Deals", href: "/recent-deals", current: false},
    {title: "Deal Categories", href: "/deal-categories", current: false},
    {title: "Community", href: "/community", current: false},
];

export default async function MainLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <Navbar navigation={navigation} />

            <div>{children}</div>

            <FooterComponent
                navigation={footerNavigation}
                social={footerSocial}
            />
        </>
    );
}
