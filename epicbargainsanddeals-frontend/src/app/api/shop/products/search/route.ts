import { NextResponse, NextRequest } from "next/server";
import { getApiUrl } from "@/lib/getApi";
import { ProductType } from "@/types/product";

async function fetchProducts(): Promise<{ results: ProductType[] }> {
    const url = getApiUrl("/shop-api/shop/affiliate_products");
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        next: {
            revalidate: 600,
        },
    });

    const data = await response.json();
    return data;
}

export async function GET(req: NextRequest) {
    const data = await fetchProducts();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") ?? "";
    const filteredData = data.results.filter((product) => {
        return product.product_name.toLowerCase().includes(query.toLowerCase());
    });

    return NextResponse.json(filteredData);
}

export const dynamic = "force-dynamic";