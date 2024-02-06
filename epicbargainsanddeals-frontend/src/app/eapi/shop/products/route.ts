import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/getApi";

// Adjust the fetchProducts to support pagination
async function fetchProducts(page: number = 1, limit: number = 20) {
    const url = getApiUrl(`/api/shop/affiliate_products?page=${page}&page_size=${limit}`);
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    return data;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const data = await fetchProducts(page, limit);
    return NextResponse.json(data);
}
