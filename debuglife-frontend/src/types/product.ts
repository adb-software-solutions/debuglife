export type ProductType = {
    id: string;
    product_name: string;
    product_image: string;
    product_price: string;
    previous_price: string;
    affiliate_link: string;
};

export type ProductPropsType = {
    products: ProductType[];
};
