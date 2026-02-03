import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This route will be used to sync parts to Shopify.
  return NextResponse.json({ message: 'This route will be used to sync parts to Shopify.' });
}
