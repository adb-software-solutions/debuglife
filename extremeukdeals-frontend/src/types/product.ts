export type ProductType = {
    id: string;
    product_name: string;
    product_image: string;
    affiliate_link: string
}

export type ProductPropsType = {
    products: ProductType[]
}