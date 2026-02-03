import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ServiceLine from '@/lib/db/models/ServiceLine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceLineId = searchParams.get('serviceLineId');

    if (!serviceLineId) {
      return NextResponse.json(
        { error: 'Service Line ID parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const serviceLineData = await ServiceLine.findOne({
      serviceLineId: parseInt(serviceLineId),
    });

    if (!serviceLineData) {
      return NextResponse.json(
        { error: 'Service line not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serviceLineData,
    });
  } catch (error: unknown) {
    console.error('Error fetching parts by service line:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch parts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
