import express, {Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import XLSX from "xlsx";
import { downloadPartsByMake, downloadPartsByServiceId } from "./db/intractor";
import { convertToExcel } from "./utils/helper";
import fs from "fs";
import { all_makes } from "./constants/makes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------------------------------------------------------
// Multer config
// ------------------------------------------------------------------
const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

// health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Root upload form
app.get("/", (_req: Request, res: Response) => {
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

// ------------------------------------------------------------------
// Upload Excel / CSV
// ------------------------------------------------------------------
// app.post(
//   "/upload",
//   upload.single("excelFile"),
//   async (req: Request, res: Response) => {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     try {
//       const workbook = XLSX.readFile(file.path);
//       const sheetName = workbook.SheetNames[0];
//       const data = XLSX.utils.sheet_to_json<any>(
//         workbook.Sheets[sheetName],
//         { header: true }
//       );

//       console.log(data);

//       if (!data.length) {
//         return res
//           .status(400)
//           .send("The uploaded file is empty or invalid.");
//       }

//       if (!Object.prototype.hasOwnProperty.call(
//         data[0],
//         "OEM REF NO LONGFORM"
//       )) {
//         return res
//           .status(400)
//           .send('Column "OEM REF NO LONGFORM" not found.');
//       }

//       const processedData = await Promise.all(
//         data.map(async (row: any) => {
//           let temp;
//           const oemRefNo = row["OEM REF NO LONGFORM"];
//           if (!oemRefNo) return row;

//           try {
//             const response = await fetchPartDetails(oemRefNo);
//             const API_Response = response[0];
//             temp = { ...row, ...API_Response };
//           } catch (error) {
//             temp = { row, error };
//           }

//           return temp;
//         })
//       );

//       const newWorkbook = XLSX.utils.book_new();
//       const newWorksheet =
//         XLSX.utils.json_to_sheet(processedData);

//       XLSX.utils.book_append_sheet(
//         newWorkbook,
//         newWorksheet,
//         "Processed Data"
//       );

//       const outputFilePath = path.join(
//         __dirname,
//         "uploads",
//         "ProcessedData.xlsx"
//       );

//       XLSX.writeFile(newWorkbook, outputFilePath);

//       res.download(outputFilePath, "ProcessedData.xlsx", (err) => {
//         if (err) console.error("Error sending file:", err);
//         fs.unlinkSync(file.path);
//         fs.unlinkSync(outputFilePath);
//       });
//     } catch (error) {
//       console.error("Error processing file:", error);
//       res.status(500).send("Error processing the file.");
//     }
//   }
// );

// ------------------------------------------------------------------
// Parts by Make (GET form)
// ------------------------------------------------------------------
app.get("/parts-by-make", (_req: Request, res: Response) => {
  const options = all_makes
    .map(
      (make: any) =>
        `<option value="${make.Id}">${make.Value}</option>`
    )
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

// ------------------------------------------------------------------
// Parts by Service Line (GET form)
// ------------------------------------------------------------------
app.get(
  "/parts-by-service-line",
  (_req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Select Service Line</title>
      </head>
      <body>
          <h1>Select Service Line</h1>
          <form action="/parts-by-service-line" method="post">
              <label for="serviceLine">Enter serviceLine ID:</label>
              <input id="serviceLine" name="serviceLine" type="text" required />
              <button type="submit">Download Parts</button>
          </form>
      </body>
      </html>
    `);
  }
);

// ------------------------------------------------------------------
// Parts by Make (POST)
// ------------------------------------------------------------------
app.post(
  "/parts-by-make",
  async (req: Request, res: Response) => {
    const makeId = parseInt(req.body.make, 10);
    const make = all_makes.find(
      (m: any) => m.Id == makeId
    );

    if (!makeId || !make) {
      return res.status(400).send("Invalid make selected.");
    }

    try {
      const partsArray = await downloadPartsByMake(
        makeId,
        false,
        true
      );

      if (!partsArray || partsArray.length === 0) {
        return res
          .status(404)
          .send("No parts found for the selected make.");
      }

      const fileName_ = `${make.Value}-PartsDetails.xlsx`;
      const fileName = path.join(__dirname, fileName_);

      convertToExcel(partsArray, fileName);

      res.download(fileName, fileName_, (err) => {
        if (err) console.error("Error sending file:", err);
        fs.unlinkSync(fileName);
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res
        .status(500)
        .send("An error occurred while processing your request.");
    }
  }
);

// ------------------------------------------------------------------
// Parts by Service Line (POST)
// ------------------------------------------------------------------
app.post(
  "/parts-by-service-line",
  async (req: Request, res: Response) => {
    const serviceLine: string = req.body.serviceLine;

    if (!serviceLine) {
      return res
        .status(400)
        .send("Invalid serviceLine received.");
    }

    try {
      const partsArray =
        await downloadPartsByServiceId(serviceLine);

      if (!partsArray || partsArray.length === 0) {
        return res
          .status(404)
          .send("No parts found for the selected service line.");
      }

      const fileName_ = `${serviceLine}-PartsDetails.xlsx`;
      const fileName = path.join(__dirname, fileName_);

      convertToExcel(partsArray, fileName);

      res.download(fileName, fileName_, (err) => {
        if (err) console.error("Error sending file:", err);
        fs.unlinkSync(fileName);
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res
        .status(500)
        .send("An error occurred while processing your request.");
    }
  }
);

export default app;
