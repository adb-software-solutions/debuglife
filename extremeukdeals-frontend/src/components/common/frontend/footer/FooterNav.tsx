import Link from 'next/link'

type FooterNavigationItem = {
    name: string;
    href: string;
};

type NavigationMenuItem = {
    title: string;
    items: FooterNavigationItem[];
};

type FooterNavProps = {
    navigation: NavigationMenuItem[];
}

export default async function FooterNavComponent({ navigation}: FooterNavProps) {
    return (
        <>
        {/* Navigation */}
        <div className="md:space-y-0 grid grid-cols-2 md:grid-cols-4 md:gap-4 col-span-2 justify-items-center md:justify-items-start">
          {navigation.map((item) => (
            <div key={item.title} className="pb-4 md:pb-0 text-center md:text-start">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider">{item.title}</h3>
              <ul role="list" className="mt-6 space-y-4">
                  {item.items.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>
          ))}
        </div>
        </>
    )
}