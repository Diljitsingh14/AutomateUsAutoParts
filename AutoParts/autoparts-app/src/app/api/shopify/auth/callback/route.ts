import { NextResponse, NextRequest } from "next/server";
import shopify from "@/lib/shopify/client";

export async function GET(request: NextRequest) {
    const callback = await shopify.auth.callback({
        rawRequest: request,
    });

    // You can now use the session to make API calls
    // const session = callback.session;
    
    // Redirect to the admin dashboard after successful authentication
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
}
