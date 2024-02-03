import Image from "next/image";
import { ProductPropsType } from "@/types/product";

export default async function LatestDealsSection({products}: ProductPropsType ) {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
                        <div key={product.id} className="grid grid-rows-[auto,1fr,auto] h-full">
                            <div className="relative h-72 w-full overflow-hidden rounded-lg">
                                <Image
                                    src={product.product_image}
                                    alt={product.product_name}
                                    className="h-full w-full object-cover object-center"
                                    width={300}
                                    height={300}
                                />
                            </div>
                            <div className="relative mt-4">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {product.product_name}
                                </h3>
                            </div>
                            <div className="mt-6">
                                <a
                                    href={product.affiliate_link}
                                    className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                                >
                                    Buy Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

