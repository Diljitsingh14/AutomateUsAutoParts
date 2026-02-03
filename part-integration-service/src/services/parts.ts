import axios from "axios";
import { MongoClient, Document } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri);

/**
 * Fetch Service Line Response from Service Barcode Number
 */
export const getPartsByServiceLine = async (
  vehicle: any,
  saveToDB: boolean = false
): Promise<any | void> => {
  const { ServiceBarcode } = vehicle.Value;
  if (!ServiceBarcode) return;

  const url = `https://estimate.mymitchell.com/PartsSelectionService/7/Vehicle/${ServiceBarcode}`;

  const queryParams = {
    country: "US",
    language: "ENG",
  };

  const headers = {
    "Content-Type": "application/json",
    Id_token: process.env.ID_TOKEN as string,
  };

  try {
    const response = await axios.get(url, {
      params: queryParams,
      headers,
    });

    console.log("Data fetched successfully:");

    if (!saveToDB) return response?.data;

    await client.connect();
    const db = client.db("AutoParts_1");
    const collection = db.collection<Document>("ServiceResponse");

    const insertResult = await collection.insertOne({
      vehicle,
      fetchedAt: new Date(),
      data: response.data,
    });

    console.log(
      `Data saved to MongoDB with _id: ${insertResult.insertedId}`
    );
  } catch (error: any) {
    console.error("Failed to fetch or save data:", error.message);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
};

/**
 * Save preprocessed parts into DB
 */
export const savePartsToDB = async (
  preprocessedParts: any[],
  vehicleInfo: any
): Promise<any> => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("AutoParts_1");
    const collection = database.collection<Document>(
      "ServiceResponseFiltered"
    );

    const document = {
      vehicle: vehicleInfo,
      parts: preprocessedParts,
    };

    const result = await collection.insertOne(document);

    console.log("Document inserted with _id:", result.insertedId);
    return result.insertedId;
  } catch (error: any) {
    console.error(
      "Error saving filtered response to MongoDB:",
      error.message
    );
    throw error;
  } finally {
    await client.close();
  }
};
