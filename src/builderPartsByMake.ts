import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { getPartByPartNumber, getServiceLineResponse } from "./db/DBintractor";
import { convertToExcel } from "./utility/helper";

// from service Line response extracts parts details and mapping
export async function builder(ServiceResponse: any, fullParts = false) {
  try {
    const partsArray: {
      PreviousPrice?: any;
      PreviousEffectiveDate?: any;
      CurrentPrice?: any;
      CurrentEffectiveDate?: any;
      PartNumber?: any;
      OriginalPartNumber?: any;
      CompressedPartNumber?: any;
      AlternatePartNumber?: any;
      TodaysPrice?: any;
      partDescription: any;
      categoryDescription: any;
      serviceDescription?: any;
      additionalDescription?: any;
      partNumber?: any;
      currentPrice?: any;
      effectiveDate?: any;
      originalPartNumber?: any;
    }[] = [];

    ServiceResponse["Categories"].forEach((cat: { [x: string]: any[] }) => {
      const categoryDescription = cat["Description"];
      const serviceDescription =
        ServiceResponse.ServiceInformation.ServiceDescription;

      cat["SubCategories"].forEach((subCat: { [x: string]: any[] }) => {
        subCat["Parts"].forEach(
          (parts: { PartDetails: { Part: any; Description: any }[] }) => {
            parts.PartDetails.forEach(({ Part, Description }) => {
              if (fullParts) {
                const p = {
                  PreviousPrice: Part?.Price?.PreviousPrice,
                  PreviousEffectiveDate: Part?.Price?.PreviousEffectiveDate,
                  CurrentPrice: Part?.Price?.CurrentPrice,
                  CurrentEffectiveDate: Part?.Price?.CurrentEffectiveDate,
                  PartNumber: Part?.Price?.PartNumber,
                  OriginalPartNumber: Part?.Price?.OriginalPartNumber,
                  CompressedPartNumber: Part?.Price?.CompressedPartNumber,
                  AlternatePartNumber: Part?.Price?.AlternatePartNumber,
                  TodaysPrice: Part?.Price?.TodaysPrice,
                  partDescription: Description,
                  categoryDescription: categoryDescription,
                };
                partsArray.push(p);
              } else {
                partsArray.push({
                  categoryDescription,
                  serviceDescription,
                  partDescription: Part?.Description || "",
                  additionalDescription: Description || "",
                  partNumber: Part?.Price?.PartNumber || "",
                  currentPrice: Part?.Price?.CurrentPrice || "",
                  effectiveDate: Part?.Price?.CurrentEffectiveDate || "",
                  originalPartNumber: Part?.Price?.OriginalPartNumber || "",
                });
              }
            });
          }
        );
      });
    });

    return partsArray;
  } catch (error: any) {
    console.error("Error in builder:", error.message);
    throw error;
  }
}

// from service line response search Parts by part number
export async function getPartByServiceLine(partnumber: any, serviceLine: any) {
  const extractedParts: any[] = [];

  try {
    // Iterate through the Categories in the response
    serviceLine.data.Categories.forEach(
      (category: { SubCategories: any[]; Description: any }) => {
        category.SubCategories.forEach(
          (subCategory: { Parts: any[]; Description: any }) => {
            subCategory.Parts.forEach((part: { PartDetails: any[] }) => {
              part.PartDetails.forEach((partDetail: { Part: any }) => {
                const { Part } = partDetail;

                // Check if the PartNumber matches the targetPartNumber
                if (Part?.Price?.PartNumber === partnumber) {
                  // Add the matching Part object to the results array
                  extractedParts.push({
                    Category: category.Description,
                    SubCategory: subCategory.Description,
                    Part: Part,
                  });
                }
              });
            });
          }
        );
      }
    );
  } catch (error: any) {
    console.error("Error extracting parts:", error.message);
  }

  return extractedParts;
}

// example:
// (async () => {
//   // const res = await getServiceLineResponse(911897);
//   // const resBuilder = await builder(res[0].data);
//   // convertToExcel(resBuilder, "toyota_86.xlsx");
//   // const parts = await getPartByPartNumber("16360-F0300");
//   // console.log(parts);
//   // const res = await getServiceLineResponse(false, 45);
//   // let parts = [];
//   // for (const r of res) {
//   //   const resBuilder = await builder(r.data);
//   //   parts = [...parts, ...resBuilder];
//   // }
//   // convertToExcel(parts, "toyota.xlsx");
// })();
