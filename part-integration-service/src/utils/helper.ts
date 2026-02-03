import * as XLSX from "xlsx";
import fs from "fs";

/**
 * Remove duplicate service lines by ServiceBarcode
 */
export const getUniqueServiceLine = async (
  res: any[]
): Promise<any[]> => {
  const filtered: any[] = [];

  for (const i of res) {
    const b = i.Value.ServiceBarcode;
    const exists = filtered.find(
      ({ Value }) => Value.ServiceBarcode == b
    );

    if (!exists) {
      filtered.push(i);
    }
  }

  return filtered;
};

/**
 * Check if any service line has null ServiceBarcode
 */
export const hasNulls = async (res: any[]): Promise<boolean> => {
  let isNull = false;

  for (const i of res) {
    const b = i.Value.ServiceBarcode;
    if (!b) isNull = true;
  }

  return isNull;
};

/**
 * Convert parts array to Excel
 */
export function convertToExcel(
  partsArray: any[],
  fileName: string = "PartsDetails.xlsx"
): void {
  try {
    const worksheet = XLSX.utils.json_to_sheet(partsArray);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Parts Details"
    );

    XLSX.writeFile(workbook, fileName);

    console.log(`Excel file created successfully: ${fileName}`);
  } catch (error: any) {
    console.error("Error creating Excel file:", error.message);
    throw error;
  }
}
