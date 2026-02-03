/**
 * Extract parts details from service line response
 */
export async function builder(
  serviceResponse: any,
  fullParts: boolean = false
): Promise<any[]> {
  try {
    const partsArray: any[] = [];

    serviceResponse["Categories"].forEach((cat: any) => {
      const categoryDescription = cat["Description"];
      const serviceDescription =
        serviceResponse.ServiceInformation.ServiceDescription;

      cat["SubCategories"].forEach((subCat: any) => {
        subCat["Parts"].forEach((parts: any) => {
          parts.PartDetails.forEach(
            ({ Part, Description }: any) => {
              if (!Part?.Price?.PartNumber) {
                console.log("skipped");
                return;
              }

              if (fullParts) {
                const p = {
                  PreviousPrice: Part?.Price?.PreviousPrice,
                  PreviousEffectiveDate:
                    Part?.Price?.PreviousEffectiveDate,
                  CurrentPrice: Part?.Price?.CurrentPrice,
                  CurrentEffectiveDate:
                    Part?.Price?.CurrentEffectiveDate,
                  PartNumber: Part?.Price?.PartNumber,
                  OriginalPartNumber:
                    Part?.Price?.OriginalPartNumber,
                  CompressedPartNumber:
                    Part?.Price?.CompressedPartNumber,
                  AlternatePartNumber:
                    Part?.Price?.AlternatePartNumber,
                  TodaysPrice: Part?.Price?.TodaysPrice,
                  partDescription: Description,
                  categoryDescription,
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
                  effectiveDate:
                    Part?.Price?.CurrentEffectiveDate || "",
                  originalPartNumber:
                    Part?.Price?.OriginalPartNumber || "",
                });
              }
            }
          );
        });
      });
    });

    return partsArray;
  } catch (error: any) {
    console.error("Error in builder:", error.message);
    throw error;
  }
}

/**
 * Search parts by part number from service line response
 */
export async function getPartByServiceLine(
  partnumber: string,
  serviceLine: any
): Promise<any[]> {
  const extractedParts: any[] = [];

  try {
    serviceLine.data.Categories.forEach((category: any) => {
      category.SubCategories.forEach((subCategory: any) => {
        subCategory.Parts.forEach((part: any) => {
          part.PartDetails.forEach((partDetail: any) => {
            const { Part } = partDetail;

            if (Part?.Price?.PartNumber === partnumber) {
              extractedParts.push({
                Category: category.Description,
                SubCategory: subCategory.Description,
                Part,
              });
            }
          });
        });
      });
    });
  } catch (error: any) {
    console.error("Error extracting parts:", error.message);
  }

  return extractedParts;
}
