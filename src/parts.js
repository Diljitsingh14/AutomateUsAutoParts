import axios from "axios";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI; // Make sure this is defined in your .env file
const client = new MongoClient(uri);

// Fetch Service Line Response from Service Barcode Number
export const getPartsByServiceLine = async (vehicle, saveToDB = false) => {
  const { ServiceBarcode } = vehicle.Value;
  if (!ServiceBarcode) return;

  const url = `https://estimate.mymitchell.com/PartsSelectionService/7/Vehicle/${ServiceBarcode}`;
  const queryParams = {
    country: "US",
    language: "ENG",
  };

  const headers = {
    // Include any required headers here
    "Content-Type": "application/json",
    Id_token: process.env.ID_TOKEN, // Example for authorization; update accordingly
  };

  try {
    // Fetch data using axios
    const response = await axios.get(url, {
      params: queryParams,
      headers,
    });

    console.log("Data fetched successfully:");
    if (!saveToDB) return response?.data;

    // Connect to MongoDB
    await client.connect();
    const db = client.db("AutoParts_1");
    const collection = db.collection("ServiceResponse");

    // Insert the fetched data into the collection
    const insertResult = await collection.insertOne({
      vehicle, // Add metadata if needed
      fetchedAt: new Date(),
      data: response.data,
    });

    console.log(`Data saved to MongoDB with _id: ${insertResult.insertedId}`);
  } catch (error) {
    console.error("Failed to fetch or save data:", error.message);
  } finally {
    // Close MongoDB connection
    await client.close();
    console.log("MongoDB connection closed.");
  }
};

// TODO CALL in upper fx.
export const savePartsToDB = async (preprocessedParts, vehicleInfo) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the database
    await client.connect();
    const database = client.db("AutoParts_1");
    const collection = database.collection("ServiceResponseFiltered");

    // Create the document to insert
    const document = {
      vehicle: vehicleInfo,
      parts: preprocessedParts,
    };

    // Insert the document into the collection
    const result = await collection.insertOne(document);

    console.log("Document inserted with _id:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error saving filtered response to MongoDB:", error.message);
    throw error;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
};
