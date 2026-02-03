export interface BuiltPart {
  categoryDescription: string;
  serviceDescription: string;
  partDescription: string;
  additionalDescription: string;
  partNumber: string;
  currentPrice: number | string;
  effectiveDate: string;
  originalPartNumber?: string;
  previousPrice?: number;
  previousEffectiveDate?: string;
  compressedPartNumber?: string;
  alternatePartNumber?: string;
  todaysPrice?: number;
}

interface PriceInfo {
  PreviousPrice?: number;
  PreviousEffectiveDate?: string;
  CurrentPrice?: number;
  CurrentEffectiveDate?: string;
  PartNumber?: string;
  OriginalPartNumber?: string;
  CompressedPartNumber?: string;
  AlternatePartNumber?: string;
  TodaysPrice?: number;
}

interface PartNode {
  Price?: PriceInfo;
  Description?: string;
}

interface PartDetailNode {
  Part?: PartNode;
  Description?: string;
}

interface PartsNode {
  PartDetails?: PartDetailNode[];
}

interface SubCategoryNode {
  Parts?: PartsNode[];
}

interface CategoryNode {
  Description?: string;
  SubCategories?: SubCategoryNode[];
}

interface ServiceResponseNode {
  Categories?: CategoryNode[];
  ServiceInformation?: {
    ServiceDescription?: string;
  };
}

// Mimics legacy builderPartsByMake.js behaviour
export function buildParts(serviceResponse: ServiceResponseNode, fullParts = false): BuiltPart[] {
  try {
    const partsArray: BuiltPart[] = [];

    (serviceResponse?.Categories ?? []).forEach((cat) => {
      const categoryDescription = cat?.Description || '';
      const serviceDescription = serviceResponse?.ServiceInformation?.ServiceDescription || '';

      (cat?.SubCategories ?? []).forEach((subCat) => {
        (subCat?.Parts ?? []).forEach((parts) => {
          (parts?.PartDetails ?? []).forEach(({ Part, Description }) => {
            if (!Part?.Price?.PartNumber) {
              return;
            }

            if (fullParts) {
              const full: BuiltPart = {
                previousPrice: Part?.Price?.PreviousPrice,
                previousEffectiveDate: Part?.Price?.PreviousEffectiveDate,
                currentPrice: Part?.Price?.CurrentPrice ?? '',
                effectiveDate: Part?.Price?.CurrentEffectiveDate || '',
                partNumber: Part?.Price?.PartNumber || '',
                originalPartNumber: Part?.Price?.OriginalPartNumber,
                compressedPartNumber: Part?.Price?.CompressedPartNumber,
                alternatePartNumber: Part?.Price?.AlternatePartNumber,
                todaysPrice: Part?.Price?.TodaysPrice,
                partDescription: Description || Part?.Description || '',
                categoryDescription,
                serviceDescription,
                additionalDescription: Description || '',
              };
              partsArray.push(full);
            } else {
              partsArray.push({
                categoryDescription,
                serviceDescription,
                partDescription: Part?.Description || '',
                additionalDescription: Description || '',
                partNumber: Part?.Price?.PartNumber || '',
                currentPrice: Part?.Price?.CurrentPrice ?? '',
                effectiveDate: Part?.Price?.CurrentEffectiveDate || '',
                originalPartNumber: Part?.Price?.OriginalPartNumber || '',
              });
            }
          });
        });
      });
    });

    return partsArray;
  } catch (error: unknown) {
    console.error('Error in buildParts:', error);
    throw error;
  }
}
