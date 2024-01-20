import Icon from "@/components/common/Icon";

export default async function HeroSectionComponent() {
    return (
        <>
            <div className="bg-brand py-5">
                <div className="px-2 md:container md:mx-auto xl:px-72 ">
                    <section
                        id="hero-section"
                        className="pt-6 text-gray-800 xl:pt-8 "
                    >
                        <div className="w-full">
                            <h1 className="text-center text-6xl font-bold">
                                View the Latest Deals
                            </h1>
                            <h2 className="mb-2 py-2 text-center text-3xl font-medium xl:mb-6">
                                Find the best deals, discounts and offers
                            </h2>
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-md">
                                    <form action="#" method="POST">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Icon
                                                iconName="magnifying-glass-solid-20"
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            name="search"
                                            id="search"
                                            className="focus:ring-brand focus:border-brand block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:outline-none focus:ring-1 sm:text-sm"
                                            placeholder="Search for deals"
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
