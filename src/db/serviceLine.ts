import { MongoClient } from "mongodb";
import { config } from "dotenv";

config(); // Load environment variables from .env

const uri = process.env.MONGO_URI; // MongoDB connection string

// The data to be inserted
const vehicleData = {
  Vehicle: {
    Next: "/Vehicle/170132",
    Id: 170133,
    Value: {
      Type: { Id: 1, Value: "Car" },
      Year: { Id: 2018, Value: 2018 },
      Make: { Id: 19, Value: "Hyundai" },
      Model: { Id: 214, Value: "Elantra" },
      SubModel: { Id: 241, Value: "SE" },
      BodyStyle: { Id: 114, Value: "4 Door Sedan" },
      Engine: { Id: 88, Value: "2.0L 4 Cyl Gas Injected" },
      Transmission: { Id: 19, Value: "6 Speed Auto Trans" },
      DriveTrain: { Id: 6, Value: "FWD" },
      Id: 170132,
      ServiceBarcode: 911852,
    },
  },
};

class VehicleDB {
  constructor() {
    this.databaseName = "AutoParts_1";
    this.collectionName = "ServiceLine";
    this.client = new MongoClient(uri);
    this.connection;
    this.db;
  }

  // Connect to MongoDB
  async connectToDB() {
    if (this.db) {
      console.log("Already connected to MongoDB.");
      return;
    }
    try {
      await this.client.connect();
      console.log("Connected to MongoDB!");
      this.db = this.client.db(this.databaseName);
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
      throw err; // Re-throw the error to let the caller handle it
    }
  }

  // Insert a document into the collection
  async insertData(vehicleData) {
    if (!this.db) {
      console.error(
        "Database not connected. Please call 'connectToDB' before inserting data."
      );
      return false;
    }
    try {
      const collection = this.db.collection(this.collectionName);
      const result = await collection.insertOne(vehicleData);
      console.log(`Document inserted with _id: ${result.insertedId}`);
      return result;
    } catch (error) {
      console.error("Error inserting document:", error.message);
      throw error; // Re-throw the error to let the caller handle it
    }
  }

  // Close the MongoDB connection
  async closeConnection() {
    if (!this.client) return;
    try {
      await this.client.close();
      console.log("MongoDB connection closed.");
      this.db = null; // Reset the db reference
    } catch (error) {
      console.error("Error closing MongoDB connection:", error.message);
    }
  }
}

async function main() {
  const vehicle_db = new VehicleDB();
  await vehicle_db.connectToDB();
  console.log(await vehicle_db.insertData(vehicleData));
  await vehicle_db.closeConnection();
}

// main();

export default VehicleDB;
