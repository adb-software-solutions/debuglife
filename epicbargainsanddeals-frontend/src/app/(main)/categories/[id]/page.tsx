import { getApiUrl } from "@/lib/getApi";
import { CategoryType } from "@/types/categories";
import LatestDealsSection from "@/components/frontend/categories/LatestDealsSection";
import HeroSectionComponent from "@/components/frontend/categories/HeroSection";

export async function generateStaticParams() {
    const res = await fetch(
        getApiUrl("/api/shop/affiliate_categories"),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const categories = await res.json();
    return categories.results.map((category : CategoryType) => ({
        params: {
            id: category.id,
        },
    }));

}


async function getProductsForCategory(id: string) {
    const res = await fetch(
        getApiUrl(`/api/shop/affiliate_categories/${id}/affiliate_products/`),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const products = await res.json();
    return products.results;
}

async function getCategoryDetails(id: string) {
    const res = await fetch(
        getApiUrl(`/api/shop/affiliate_categories/${id}`),
        {
            next: {
                revalidate: 600,
            }
        },
    );
    const category = await res.json();
    return category;
}

export default async function CategoryPage({params}: {params: {id: string}}) {
    const products = await getProductsForCategory(params.id);
    const category = await getCategoryDetails(params.id);

    return (
        <>
            <HeroSectionComponent category_name={category.category_name} />
            <LatestDealsSection products={products} />
        </>
    );
}
