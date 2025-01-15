import * as XLSX from "xlsx";
import fs from "fs";

export const getUniqueServiceLine = async (res) => {
  const filtered = [];
  for (const i of res) {
    const b = i.Value.ServiceBarcode;
    const c = filtered.find(({ Value }) => Value.ServiceBarcode == b);
    if (!c) {
      filtered.push(i);
    }
  }
  return filtered;
};

export const hasNulls = async (res) => {
  let isNull = false;
  for (const i of res) {
    const b = i.Value.ServiceBarcode;
    if (!b) isNull = true;
  }
  return isNull;
};

export function convertToExcel(partsArray, fileName = "PartsDetails.xlsx") {
  try {
    // Convert the array of objects into a worksheet
    const worksheet = XLSX.utils.json_to_sheet(partsArray);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parts Details");

    // Write the workbook to a file
    XLSX.writeFile(workbook, fileName);

    console.log(`Excel file created successfully: ${fileName}`);
  } catch (error) {
    console.error("Error creating Excel file:", error.message);
    throw error;
  }
}
