type HeroSectionProps = {
    category_name: string;
};

const HeroSectionComponent: React.FC<HeroSectionProps> = ({ category_name }) => {
    return (
        <>
            <div className="bg-brand py-5">
                <div className="px-2 md:container md:mx-auto xl:px-72">
                    <section id="hero-section" className="pt-6 text-gray-800 xl:pt-8">
                        <div className="w-full">
                            <h1 className="text-center text-6xl font-bold">
                                {category_name}
                            </h1>
                            <h2 className="mb-2 py-2 text-center text-3xl font-medium xl:mb-6">
                                Find the best deals, discounts, and offers
                            </h2>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default HeroSectionComponent;
