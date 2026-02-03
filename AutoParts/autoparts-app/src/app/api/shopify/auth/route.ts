import { NextResponse, NextRequest } from "next/server";
import shopify from "@/lib/shopify/client";

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');
  if (!shop) {
    return new Response("Missing shop parameter", { status: 400 });
  }
  
  return await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(shop, true),
    callbackPath: "/api/shopify/auth/callback",
    isOnline: false,
    rawRequest: request,
  });
}
