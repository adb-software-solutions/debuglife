import Link from "next/link";
import IconComponent from "../../Icon";

type SocialItem = {
    name: string;
    href: string;
    icon: string;
}

type FooterSocialProps = {
    social: SocialItem[];
}

export default async function FooterSocialComponent({ social }: FooterSocialProps) {
    return (
        <>
            <div className="flex justify-center md:justify-end space-x-6 md:order-3">
                {social.map((item) => (
                    <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">{item.name}</span>
                    <IconComponent iconName={item.icon} className="h-6 w-6" aria-hidden="true" />
                    </a>
                ))}
            </div>
        </>
    )
}