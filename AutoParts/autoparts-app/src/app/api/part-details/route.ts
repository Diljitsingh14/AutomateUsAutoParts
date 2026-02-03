import { NextRequest, NextResponse } from 'next/server';
import { fetchPartDetails } from '@/lib/api/fetchData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partNumber = searchParams.get('partNumber');

    if (!partNumber) {
      return NextResponse.json(
        { error: 'Part number parameter is required' },
        { status: 400 }
      );
    }

    const partData = await fetchPartDetails(partNumber);

    return NextResponse.json({
      success: true,
      data: partData,
    });
  } catch (error: unknown) {
    console.error('Error fetching part details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch part details';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
