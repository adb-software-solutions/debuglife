import Image from "next/image"

export default async function AboutContentSection() {
    return (
        <section id="content-section">
            {/* Text on left, image on right */}
            <div className="bg-white">
                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-y-10 gap-x-6 lg:gap-x-8 lg:gap-y-16">
                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl font-bold text-center md:text-start tracking-tight text-gray-800 sm:text-4xl">
                                    What is SellerDesk?
                                </h2>
                                <p className="mt-6 text-lg leading-7 text-center md:text-start text-gray-600">
                                    SellerDesk is a tool for eBay sellers to manage their
                                    inventory, orders, and listings and analyze their sales,
                                    profits, and expenses. SellerDesk is built for resellers,
                                    by two fellow eBay resellers. We know the pain points of
                                    managing an eBay business, and we&apos;ve built SellerDesk
                                    to solve them. SellerDesk integrates directly with eBay to
                                    provide you with a simple, easy to use interface to manage
                                    your eBay business. It pulls in data in real time, removing
                                    the need for manual data entry. SellerDesk will pull in your
                                    listings automatically. And all you need to do is enter your
                                    cost of goods and shipping costs, and SellerDesk will calculate
                                    your profits for you. SellerDesk also provides you with detailed
                                    reports on your sales, profits and expenses.
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <div className="image-container">
                                    <Image
                                        className="w-full h-full"
                                        src="/images/about-app-screenshot.jpg"
                                        alt="Screenshot of the SellerDesk dashboard."
                                        width={500}
                                        height={500}
                                    />
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </section>
    )
}