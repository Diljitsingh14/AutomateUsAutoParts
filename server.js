import express from "express";
import multer from "multer";
import path from "path";
import XLSX from "xlsx";
import fs from "fs";
import { fetchPartDetails } from "./fetchData.js";
import { all_makes } from "./vehicle.js";
import { downloadPartsByMake, downloadPartsByServiceId } from "./src/db/DBintractor.js";
import { convertToExcel } from "./src/utility/helper.js";

const __dirname = path.resolve(); // Required since `__dirname` is not defined in ES modules.

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Configure Multer to save files in the "uploads" directory
const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

// Serve the HTML form to upload an Excel/CSV file
app.get("/", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Upload Excel/CSV File</title>
        </head>
        <body>
            <h1>Upload Excel/CSV File</h1>
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="excelFile" accept=".xlsx, .xls, .csv" required />
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
    `);
});

// Endpoint to handle the uploaded Excel/CSV file
app.post("/upload", upload.single("excelFile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Read the file using XLSX
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: true,
    });

    console.log(data);

    if (!data.length) {
      return res.status(400).send("The uploaded file is empty or invalid.");
    }

    // Check if the "OEM REF NO LONGFORM" column exists
    if (!data[0].hasOwnProperty("OEM REF NO LONGFORM")) {
      return res.status(400).send('Column "OEM REF NO LONGFORM" not found.');
    }

    // Iterate over rows and hit the API
    const processedData = await Promise.all(
      data.map(async (row) => {
        let temp;
        const oemRefNo = row["OEM REF NO LONGFORM"];
        if (!oemRefNo) return row; // Skip rows without data

        try {
          // Make an API call
          const response = await fetchPartDetails(oemRefNo);
          // Append the response to the row
          const API_Response = response[0];
          temp = { ...row, ...API_Response };
        } catch (error) {
          temp = { row, error: error };
        }

        return temp;
      })
    );

    // Convert the processed data back to a worksheet
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data");

    // Save the modified file
    const outputFilePath = path.join(
      __dirname,
      "uploads",
      "ProcessedData.xlsx"
    );
    XLSX.writeFile(newWorkbook, outputFilePath);

    // Respond with the downloadable file
    res.download(outputFilePath, "ProcessedData.xlsx", (err) => {
      if (err) console.error("Error sending file:", err);
      // Clean up files after download
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputFilePath);
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing the file.");
  }
});

// GET endpoint to render the dropdown form
app.get("/parts-by-make", (req, res) => {
  const options = all_makes
    .map((make) => `<option value="${make.Id}">${make.Value}</option>`)
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Select Make</title>
    </head>
    <body>
        <h1>Select Vehicle Make</h1>
        <form action="/parts-by-make" method="post">
            <label for="make">Choose a make:</label>
            <select id="make" name="make" required>
                ${options}
            </select>
            <button type="submit">Download Parts</button>
        </form>
    </body>
    </html>
  `);
});



// GET endpoint to render the dropdown form
app.get("/parts-by-service-line", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Select Make</title>
    </head>
    <body>
        <h1>Select Vehicle Make</h1>
        <form action="/parts-by-service-line" method="post">
            <label for="serviceLine">Enter serviceLine ID:</label>
            <input id="serviceLine" name="serviceLine" type="text"  required />
               
            <button type="submit">Download Parts</button>
        </form>
    </body>
    </html>
  `);
});

// function convertToExcel(partsArray, fileName = "PartsDetails.xlsx") {
//   try {
//     const worksheet = XLSX.utils.json_to_sheet(partsArray);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Parts Details");
//     XLSX.writeFile(workbook, fileName);
//     console.log(`Excel file created successfully: ${fileName}`);
//   } catch (error) {
//     console.error("Error creating Excel file:", error.message);
//     throw error;
//   }
// }

// POST endpoint to handle form submission and generate Excel file
app.post("/parts-by-make", async (req, res) => {
  const makeId = parseInt(req.body.make, 10);
  const make = all_makes.find((m) => m.Id == makeId);
  console.log(make);
  if (!makeId || !make) {
    return res.status(400).send("Invalid make selected.");
  }

  try {
    const partsArray = await downloadPartsByMake(makeId, false, true);

    if (!partsArray || partsArray.length === 0) {
      return res.status(404).send("No parts found for the selected make.");
    }

    const fileName_ = `${make.Value}-PartsDetails.xlsx`;
    const fileName = path.join(__dirname, fileName_);
    convertToExcel(partsArray, fileName);

    res.download(fileName, fileName_, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      // Clean up the file after download
      fs.unlinkSync(fileName);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.post("/parts-by-service-line", async (req, res) => {
  const serviceLine = req.body.serviceLine;
  console.log(serviceLine);
  if (!serviceLine) {
    return res.status(400).send("Invalid serviceLine received.");
  }

  try {
    const partsArray = await downloadPartsByServiceId(serviceLine);

    if (!partsArray || partsArray.length === 0) {
      return res.status(404).send("No parts found for the selected make.");
    }

    const fileName_ = `${serviceLine}-PartsDetails.xlsx`;
    const fileName = path.join(__dirname, fileName_);
    convertToExcel(partsArray, fileName);

    res.download(fileName, fileName_, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      // Clean up the file after download
      fs.unlinkSync(fileName);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
