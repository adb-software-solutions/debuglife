import Link from "next/link";
import React from "react";

interface NavBarItemsProps {
    item: {
        title: string;
        href: string;
        current: boolean;
    };
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const MobileNavBarItem: React.FC<NavBarItemsProps> = ({ item }) => {
    return (
        <Link
            key={item.title}
            href={item.href}
            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
        >
            {item.title}
        </Link>
    );
};

export default MobileNavBarItem;
