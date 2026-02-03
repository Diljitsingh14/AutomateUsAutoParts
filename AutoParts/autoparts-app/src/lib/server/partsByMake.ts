import axios from 'axios';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import { convertToExcel } from '@/lib/utils/excelHelper';
import { buildParts, BuiltPart } from './builderPartsByMake';

interface LegacyValue {
  Make?: { Id?: number; Value?: string };
  Model?: { Id?: number; Value?: string };
  Year?: { Id?: number; Value?: string };
  Type?: { Id?: number; Value?: string };
  ServiceBarcode?: string;
  [key: string]: unknown;
}

interface LegacyServiceLine {
  Value?: LegacyValue;
  _id?: unknown;
  [key: string]: unknown;
}

const PARTS_ENDPOINT = 'https://estimate.mymitchell.com/PartsSelectionService/7/Vehicle/';

async function fetchServiceLinesByMake(makeId: number): Promise<LegacyServiceLine[]> {
  await connectDB();
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('Database connection is not initialized');
  }
  const collection = mongoose.connection.db.collection('ServiceLine');
  const results = await collection
    .find({ 'Value.Make.Id': makeId })
    .toArray();
  return results as LegacyServiceLine[];
}

function dedupeServiceLines(lines: LegacyServiceLine[]): LegacyServiceLine[] {
  const seen = new Set<string>();
  const unique: LegacyServiceLine[] = [];
  for (const line of lines) {
    const key = String(
      line?.Value?.ServiceBarcode ||
        line?.Value?.Id ||
        (line?._id as string | undefined) ||
        Math.random()
    );
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(line);
  }
  return unique;
}

async function getPartsByServiceLine(line: LegacyServiceLine) {
  const serviceBarcode = line?.Value?.ServiceBarcode;
  if (!serviceBarcode) return null;

  const idToken = process.env.ID_TOKEN;
  if (!idToken) {
    throw new Error('ID_TOKEN is not set in environment variables');
  }

  const url = `${PARTS_ENDPOINT}${serviceBarcode}`;
  const queryParams = { country: 'US', language: 'ENG' };

  const response = await axios.get(url, {
    params: queryParams,
    headers: { Id_token: idToken },
  });

  return response.data;
}

export async function buildPartsWorkbookForMake(makeId: number) {
  const serviceLines = await fetchServiceLinesByMake(makeId);
  if (!serviceLines.length) {
    throw new Error('No service lines found for this make');
  }

  const uniqueLines = dedupeServiceLines(serviceLines);
  let allParts: BuiltPart[] = [];

  for (const line of uniqueLines) {
    try {
      const response = await getPartsByServiceLine(line);
      if (!response) continue;
      const parts = buildParts(response, true);
      allParts = allParts.concat(parts);
    } catch (error) {
      console.error('Failed to fetch parts for a service line:', error);
      continue;
    }
  }

  if (!allParts.length) {
    throw new Error('No parts found for the selected make');
  }

  const buffer = convertToExcel(allParts, 'PartsDetails.xlsx');
  const makeName = serviceLines[0]?.Value?.Make?.Value || 'make';
  const fileName = `${makeName}-PartsDetails.xlsx`;

  return { buffer, fileName };
}
