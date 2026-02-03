import { MongoClient, Document, FindOptions } from "mongodb";
import { config } from "dotenv";

import {
  convertToExcel,
  getUniqueServiceLine,
  hasNulls,
} from "../utils/helper";

import { getPartsByServiceLine, savePartsToDB } from "../services/parts";
import { builder, getPartByServiceLine } from "../builders/partsByMake";

config(); // Load environment variables

const uri = process.env.MONGO_URI as string;
const databaseName = "AutoParts_1";

/**
 * Base MongoDB query executor
 */
import { WithId } from "mongodb";

export async function executeQuery<T extends Document = Document>(
  collectionName: string,
  query: Record<string, unknown>,
  options: FindOptions = {}
): Promise<WithId<T>[]> {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(databaseName);
    const collection = db.collection<T>(collectionName);

    const result = await collection.find(query as any, options).toArray();
    return result;
  } catch (error: any) {
    console.error("Error executing MongoDB query:", error.message);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

/**
 * Fetch service lines by make and optional filters
 */
export async function getServiceLinesByMake(
  makeId: number,
  year: string | number = "",
  type: string | number = "",
  from: string | number = "",
  to: string | number = "",
  not: string | number = "",
  model: string | number = ""
): Promise<any[] | undefined> {
  const collectionName = "ServiceLine";
  const query: Record<string, any> = {
    "Value.Make.Id": makeId,
  };

  if (year) {
    let more = false;
    let y: any = {};

    if (from) {
      y["$gte"] = from;
      more = true;
    }
    if (to) {
      y["$lte"] = to;
    }
    if (not) {
      y["$not"] = not;
    }
    if (!more) {
      y = year;
    }

    query["Value.Year.Id"] = y;
  }

  if (type) {
    query["Value.Type.Id"] = type;
  }

  if (model) {
    query["Value.Model.Id"] = model;
  }

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);
    return results;
  } catch (error: any) {
    console.error("Failed to fetch data:", error.message);
  }
}

/**
 * Fetch service lines by year
 */
export async function getServiceLinesByYear(
  year: number,
  op: "eq" | "gt" | "lt" = "eq"
): Promise<any[] | undefined> {
  const collectionName = "ServiceLine";
  const query: Record<string, any> = {};

  switch (op) {
    case "eq":
      query["Value.Year.Id"] = year;
      break;
    case "gt":
      query["Value.Year.Id"] = { $gt: year };
      break;
    case "lt":
      query["Value.Year.Id"] = { $lt: year };
      break;
    default:
      query["Value.Year.Id"] = year;
  }

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);
    return results;
  } catch (error: any) {
    console.error("Failed to fetch data:", error.message);
  }
}

/**
 * Fetch stored service responses
 */
export async function getServiceLineResponse(
  id?: string,
  makeId?: number
): Promise<any[] | undefined> {
  const collectionName = "ServiceResponse";
  const query: Record<string, any> = {};

  if (id) {
    query["data.ServiceId"] = id;
  }
  if (makeId) {
    query["vehicle.Value.Make.Id"] = makeId;
  }

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);
    return results;
  } catch (error: any) {
    console.error("Failed to fetch data:", error.message);
  }
}

/**
 * Find parts by part number across service responses
 */
export async function getPartByPartNumber(
  partNumber: string
): Promise<any[] | undefined> {
  const collectionName = "ServiceResponse";
  const query = {
    "data.Categories.SubCategories.Parts.PartDetails.Part.Price.PartNumber":
      partNumber,
  };

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);

    let parts: any[] = [];

    if (results.length > 0) {
      for (const r of results) {
        const part = await getPartByServiceLine(partNumber, r);
        parts = [...parts, ...part];
      }
      return parts;
    }
  } catch (error: any) {
    console.error("Failed to fetch data:", error.message);
  }
}

/**
 * Download parts by service ID
 */
export const downloadPartsByServiceId = async (
  id: string
): Promise<any[]> => {
  const response = await getPartsByServiceLine({
    Value: { ServiceBarcode: id },
  });

  console.log("response for Id :", id, response);

  if (response) {
    const partXcel = await builder(response);
    return partXcel;
  }
  return [];
};

/**
 * Download parts by make
 */
export const downloadPartsByMake = async (
  id: number,
  saveParts = false,
  fromUI = false
): Promise<any[] | void> => {
  const res = await getServiceLinesByMake(id);
  console.log(res?.length);

  if (!res) return;

  const filtered = await getUniqueServiceLine(res);
  const nulls = await hasNulls(res);

  console.log(filtered.length, nulls);

  let idx = 0;
  let full_res: any[] = [];

  for (const item of filtered) {
    console.log(idx);
    console.log("fetching");

    try {
      const response = await getPartsByServiceLine(item);

      if (response) {
        const part = await builder(response, true);
        const partXcel = await builder(response);

        const vehicleInfo = {
          serviceDescription:
            response.ServiceInformation.ServiceDescription,
          country: "US",
          ...item.Value,
        };

        if (saveParts) {
          await savePartsToDB(part, vehicleInfo);
        }

        idx++;
        full_res = [...full_res, ...partXcel];
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error.message);
    }
  }

  if (fromUI) return full_res;

  convertToExcel(full_res, "Kia.xlsx");
};

/**
 * Internal utility: remove duplicate vehicle IDs
 * (kept as-is, not exported)
 */
async function removeDuplicateVehicleIds(): Promise<void> {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection("ServiceResponseFiltered");

    const duplicates = await collection
      .aggregate([
        {
          $group: {
            _id: "$vehicle.Id",
            count: { $sum: 1 },
            ids: { $push: "$_id" },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    console.log("duplicates", duplicates[0]);

    for (const group of duplicates) {
      const idsToDelete = group.ids.slice(1);
      await collection.deleteMany({ _id: { $in: idsToDelete } });
    }

    console.log("Duplicate vehicle.Id documents removed.");
  } catch (err) {
    console.error("Error removing duplicates:", err);
  } finally {
    await client.close();
  }
}
