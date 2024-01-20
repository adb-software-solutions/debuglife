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

const NavBarItem: React.FC<NavBarItemsProps> = ({ item }) => {
    return (
        <Link
            key={item.title}
            href={item.href}
            className="text-lg font-normal leading-6 text-gray-900"
        >
            {item.title}
        </Link>
    );
};

export default NavBarItem;
