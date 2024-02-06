import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/getApi";

async function fetchCategories() {
    const url = getApiUrl(`/shop-api/shop/affiliate_categories`);
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
    const data = await fetchCategories();
    return NextResponse.json(data);
}

export const dynamic = "force-dynamic";