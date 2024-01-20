import Image from "next/image";
import IconComponent from "@/components/common/Icon";

type SocialItem = {
    name: string;
    href: string;
    icon: string;
};

type PersonItem = {
    name: string;
    role: string;
    image: string;
    social: SocialItem[];
};

export default async function TeamMemberItem(person: PersonItem) {
    return (
        <>
            <li key={person.name} className="">
                <Image
                    className="mx-auto h-56 w-56 rounded-full"
                    src={person.image}
                    alt=""
                    width={224}
                    height={224}
                />
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900">
                    {person.name}
                </h3>
                <p className="text-sm leading-6 text-gray-600">{person.role}</p>
                <ul role="list" className="mt-6 flex justify-center gap-x-6">
                    {person.social.map((item) => (
                        <li key={item.name}>
                            <a
                                href={item.href}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">{item.name}</span>
                                <IconComponent
                                    iconName={item.icon}
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </li>
        </>
    );
}
