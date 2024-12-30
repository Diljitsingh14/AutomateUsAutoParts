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

(async () => {
  const res = await getServiceLinesByMake(45);
  console.log(res.length);
  const filtered = await getUniqueServiceLine(res);
  const nulls = await hasNulls(res);
  console.log(filtered.length, nulls);
  let idx = 0;
  let full_res = [];
  for (const item of filtered) {
    console.log(idx);
    console.log("fetching");
    const response = await getPartsByServiceLine(item);
    const part = await builder(response, true);
    const partXcel = await builder(response);
    const vehicleInfo = {
      serviceDescription: response.ServiceInformation.ServiceDescription,
      country: "US",
      ...item.Value,
    };
    await savePartsToDB(part, vehicleInfo);
    idx++;
    full_res = [...full_res, ...partXcel];
  }
  convertToExcel(full_res, "toyota_US.xlsx");
})();

// (async () => {
//   const res = await getServiceLinesByMake(25);
//   console.log(res.length);
//   const filtered = await getUniqueServiceLine(res);
//   const nulls = await hasNulls(res);
//   let idx = 0;
//   for (const item of filtered) {
//     console.log(idx);
//     if (idx == 0) {
//       idx++;
//       continue;
//     } else {
//       console.log("fetching");
//       await getPartsByServiceLine(item);
//     }
//     idx++;
//   }
//   console.log(filtered.length, nulls);
// })();
