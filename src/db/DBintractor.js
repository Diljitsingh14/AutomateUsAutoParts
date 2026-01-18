import { MongoClient } from "mongodb";
import { config } from "dotenv";
import {
  convertToExcel,
  getUniqueServiceLine,
  hasNulls,
} from "../utility/helper.js";
import { getPartsByServiceLine, savePartsToDB } from "../parts.js";
import { builder, getPartByServiceLine } from "../../builderPartsByMake.js";

config(); // Load environment variables from .env

const uri = process.env.MONGO_URI;

const databaseName = "AutoParts_1";

// base query execution
export async function executeQuery(collectionName, query, options = {}) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB");

    // Access the specified database and collection
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Execute the query with optional parameters
    const result = await collection.find(query, options).toArray();

    // Return the query result
    return result;
  } catch (error) {
    console.error("Error executing MongoDB query:", error.message);
    throw error;
  } finally {
    // Ensure the connection is closed
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// main extract function to get service line by diff params.
export async function getServiceLinesByMake(
  makeId,
  year = "",
  type = "",
  from = "",
  to = "",
  not = "",
  model = ""
) {
  const collectionName = "ServiceLine";
  const query = { "Value.Make.Id": makeId };
  if (year) {
    let more = false;
    let y = {};
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
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
  }
}

export async function getServiceLinesByYear(year, op = "eq") {
  const collectionName = "ServiceLine";
  const query = {};
  switch (op) {
    case "eq": {
      query["Value.Year.Id"] = year;
      break;
    }
    case "gt": {
      query["Value.Year.Id"] = { $gt: year };
      break;
    }
    case "lt": {
      query["Value.Year.Id"] = { $gt: year };
      break;
    }

    default: {
      query["Value.Year.Id"] = year;
    }
  }

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);
    return results;
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
  }
}

export async function getServiceLineResponse(id, makeId) {
  const collectionName = "ServiceResponse";
  let query = {};
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
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
  }
}

export async function getPartByPartNumber(partNumber) {
  const collectionName = "ServiceResponse";
  const query = {
    "data.Categories.SubCategories.Parts.PartDetails.Part.Price.PartNumber":
      partNumber,
  };

  try {
    const results = await executeQuery(collectionName, query);
    console.log(query);
    let parts = [];
    if (results.length > 0) {
      for (const r of results) {
        const part = await getPartByServiceLine(partNumber, r);
        parts = [...parts, ...part];
      }
      return parts;
    }
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
  }
}

export const downloadPartsByServiceId = async (id) => {
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

export const downloadPartsByMake = async (
  id,
  saveParts = false,
  fromUI = false
) => {
  const res = await getServiceLinesByMake(id);
  console.log(res?.length);
  const filtered = await getUniqueServiceLine(res);
  const nulls = await hasNulls(res);
  console.log(filtered.length, nulls);
  let idx = 0;
  let full_res = [];
  for (const item of filtered) {
    console.log(idx);
    console.log("fetching");
    try {
      const response = await getPartsByServiceLine(item);
      if (response) {
        const part = await builder(response, true);
        const partXcel = await builder(response);
        const vehicleInfo = {
          serviceDescription: response.ServiceInformation.ServiceDescription,
          country: "US",
          ...item.Value,
        };
        if (saveParts) await savePartsToDB(part, vehicleInfo);
        idx++;
        full_res = [...full_res, ...partXcel];
      }
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
    }
  }
  if (fromUI) return full_res;
  convertToExcel(full_res, "Kia.xlsx");
};

async function removeDuplicateVehicleIds() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("AutoParts_1");
    const collection = db.collection("ServiceResponseFiltered");

    // Find duplicates
    const duplicates = await collection
      .aggregate([
        {
          $group: {
            _id: "$vehicle.Id", // Group by vehicle.Id
            count: { $sum: 1 }, // Count occurrences
            ids: { $push: "$_id" }, // Collect all _id values
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // Only groups with more than one document
          },
        },
      ])
      .toArray();

    console.log("duplicates", duplicates[0]);

    for (const group of duplicates) {
      const idsToDelete = group.ids.slice(1); // Exclude the first ID
      await collection.deleteMany({ _id: { $in: idsToDelete } });
    }

    console.log("Duplicate vehicle.Id documents removed.");
  } catch (err) {
    console.error("Error removing duplicates:", err);
  } finally {
    await client.close();
  }
}

// removeDuplicateVehicleIds();

// downloadPartsByMake(id=19);

// (async () => {
//   const res = await getServiceLinesByMake(50, "", 4, 2022, 2024, "", 3191);
//   // const res = await getServiceLinesByMake(19);
//   console.log(res.length);
//   const filtered = await getUniqueServiceLine(res);
//   const nulls = await hasNulls(res);
//   let idx = 0;
//   let full = [];
//   for (const item of filtered) {
//     console.log(idx);
//     if (idx == -1) {
//       idx++;
//       continue;
//     } else {
//       console.log("fetching");
//       const data = await getPartsByServiceLine(item);
//       const partXcel = await builder(data);
//       full = [...full, ...partXcel];
//     }
//     idx++;
//   }
//   convertToExcel(full, "Kia-CARNIVAL_22-24-1.xlsx");
//   console.log(filtered.length, nulls);
// })();
