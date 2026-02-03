import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ServiceLine from '@/lib/db/models/ServiceLine';
import { buildPartsWorkbookForMake } from '@/lib/server/partsByMake';

// Legacy-compatible data fetch (JSON)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');

    if (!make) {
      return NextResponse.json(
        { error: 'Make parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const serviceLinesData = await ServiceLine.find({ make });

    return NextResponse.json({
      success: true,
      count: serviceLinesData.length,
      data: serviceLinesData,
    });
  } catch (error: unknown) {
    console.error('Error fetching parts by make:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch parts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Legacy-compatible Excel download (POST)
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let makeId: number | null = null;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      makeId = Number(body.makeId ?? body.make ?? body.id);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      makeId = Number(form.get('make'));
    }

    if (!makeId || Number.isNaN(makeId)) {
      return NextResponse.json(
        { error: 'Invalid makeId received.' },
        { status: 400 }
      );
    }

    const { buffer, fileName } = await buildPartsWorkbookForMake(makeId);

    const body = new Uint8Array(buffer);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error processing parts-by-make:', error);
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
