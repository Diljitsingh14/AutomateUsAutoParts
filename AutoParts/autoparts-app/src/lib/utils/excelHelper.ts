import * as XLSX from 'xlsx';

export interface PartData {
  [key: string]: any;
}

export function convertToExcel(partsArray: PartData[], fileName: string = 'PartsDetails.xlsx'): Buffer {
  try {
    const worksheet = XLSX.utils.json_to_sheet(partsArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parts Details');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error: any) {
    console.error('Error creating Excel file:', error.message);
    throw error;
  }
}

export function readExcelFile(buffer: Buffer): PartData[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<PartData>(worksheet);
    return data;
  } catch (error: any) {
    console.error('Error reading Excel file:', error.message);
    throw error;
  }
}
