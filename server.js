const express = require("express");
const multer = require("multer");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");
const axios = require("axios");
const { fetchPartDetails } = require("./fetchData");

const app = express();
const port = 3000;

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
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

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
    // res.status(200).send(processedData);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing the file.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
