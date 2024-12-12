import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

async function builder() {
  console.log("Reading honda-civic.json...");

  try {
    // Resolve __dirname for ES module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Define the path to the JSON file
    const filePath = path.join(__dirname, "honda-civic.json");

    // Read and parse the JSON file
    const fileContent = await fs.readFile(filePath, "utf-8");
    const hondaParts = JSON.parse(fileContent);

    // Log the parsed JSON data
    hondaParts["Categories"].forEach((cat) => {
      console.log("=======", cat["Description"]);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++");
      cat["SubCategories"].forEach((subCat) => {
        // console.log(subCat["Description"], subCat["Parts"].length);
        subCat["Parts"].forEach((parts) => {
          parts.PartDetails.forEach(({ Part }) => {
            console.log(
              hondaParts.ServiceInformation.ServiceDescription.split(""),
              "|",
              Part?.Description,
              "|",
              Part?.Price?.PartNumber,
              "|",
              Part?.Price?.CurrentPrice,
              "|",
              Part?.Price?.CurrentEffectiveDate,
              "|",
              Part?.Price?.OriginalPartNumber
            );
          });
        });
      });
      console.log("-----------------------------------------------");
    });

    // Add your additional processing logic here
  } catch (error) {
    console.error("Error reading the JSON file:", error.message);
  }
}

builder();
