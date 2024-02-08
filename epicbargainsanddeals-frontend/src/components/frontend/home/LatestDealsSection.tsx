import Image from "next/image";
import {ProductPropsType} from "@/types/product";

export default function LatestDealsSection({products}: ProductPropsType) {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-8 lg:max-w-7xl lg:px-8">
                <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="grid h-full grid-rows-[auto,1fr,auto]"
                        >
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
                            <div className="mt-2">
                                <a
                                    href={product.affiliate_link}
                                    className="bg-brand hover:bg-brand relative flex items-center justify-center rounded-md border border-transparent px-8 py-2 text-sm font-medium text-gray-900"
                                >
                                    Buy from Amazon
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
