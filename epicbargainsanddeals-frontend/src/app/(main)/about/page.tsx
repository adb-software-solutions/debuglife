import Navbar from '@/components/common/frontend/NavBar'
import FooterComponent from "@/components/common/frontend/footer/Footer";
import AboutHeroSection from '@/components/frontend/about/AboutHeroSection';
import AboutContentSection from '@/components/frontend/about/AboutContentSection';
import AboutTeamSection from '@/components/frontend/about/AboutTeamSection';
import { footerNavigation, footerSocial } from "@/fixtures/footerData";

const navigation = [
    {title: "Home", href: "/", current: false},
    {title: "Features", href: "/features", current: false},
    {title: "Pricing", href: "/pricing", current: false},
    {title: "About", href: "/about", current: true},
    {title: "FAQs", href: "/faqs", current: false},
    {title: "Blog", href: "/blog", current: false},
    {title: "Contact", href: "/contact", current: false},
]

const team = [
    {
        name: "Adam Birds",
        role: "Co-Founder",
        image: "/images/team/adam-birds.jpg",
        social: [
            {
                name: "X",
                href: "https://x.com/adambirds",
                icon: "x-solid",
            },
            {
                name: "LinkedIn",
                href: "https://www.linkedin.com/in/adambirds/",
                icon: "linkedin-solid",
            },
        ],
    },
    {
        name: "Sam Warren",
        role: "Co-Founder",
        image: "/images/team/sam-warren.jpg",
        social: [
            {
                name: "YouTube",
                href: "https://www.youtube.com/@samsellsstuff325",
                icon: "youtube-solid",
            },
        ],
    }
]

export default async function AboutPage() {
    return (
        <div>
            <Navbar
                navigation={navigation}
            />

            <AboutHeroSection />

            <AboutContentSection />

            <AboutTeamSection team={team}/>

            <FooterComponent navigation={footerNavigation} social={footerSocial} />
        </div>
    )
}
