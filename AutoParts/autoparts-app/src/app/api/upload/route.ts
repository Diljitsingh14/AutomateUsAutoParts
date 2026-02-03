import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { readExcelFile } from '@/lib/utils/excelHelper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('excelFile') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    // Read and process Excel file
    const data = readExcelFile(buffer);

    return NextResponse.json({
      success: true,
      message: `File uploaded successfully: ${file.name}`,
      rowCount: data.length,
      data: data.slice(0, 10), // Return first 10 rows as preview
    });
  } catch (error: unknown) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
