import FooterNewsletterComponent from "./FooterNewsletter";
import FooterSocialComponent from "./FooterSocial";
import FooterNavComponent from "./FooterNav";

type FooterNavigationItem = {
    name: string;
    href: string;
};

type NavigationMenuItem = {
    title: string;
    items: FooterNavigationItem[];
};

type SocialItem = {
    name: string;
    href: string;
    icon: string;
};

type FooterProps = {
    navigation: NavigationMenuItem[];
    social: SocialItem[];
};

export default async function FooterComponent({
    navigation,
    social,
}: FooterProps) {

    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="mt-8 border-t bg-white"
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-10">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <FooterNavComponent navigation={navigation} />

                    <FooterNewsletterComponent />
                </div>
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-10">
                    <FooterSocialComponent social={social} />
                    <p className="mt-8 text-xs leading-5 text-gray-500 md:order-1 md:mt-0 text-center md:text-start md:pr-8">
                        &copy; {currentYear} SellerDesk Ltd. All rights reserved. eBay is a trademark of eBay, Inc. This application uses the eBay API but is not endorsed or certified by eBay, Inc.
                    </p>
                    <p className="mt-8 text-xs leading-5 text-gray-500 md:order-2 md:mt-0 text-center md:text-start md:pr-8">
                        This website uses affiliate links. We may earn a commission if you make a purchase through these links, at no additional cost to you.
                    </p>
                </div>
            </div>
        </footer>
    );
}
