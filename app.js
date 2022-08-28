const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const csv = require("fast-csv");
const papa = require("papaparse");
require("dotenv").config();

let data = [];
let updatedData = [];

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/v1/posts/update/sold-status", (req, res) => {
  //Check if API key is valid
  if (process.env.APIKEY !== req.query.apikey) {
    return res.status(401).json({ message: "API Key not authorized" });
  }

  data = [];

  const uid = req.body.uid;
  const isSold = req.body.isSold;

  //handle errors

  if (!uid) {
    return res.status(400).json({ message: "No UID provided" });
  }

  if (isSold === undefined) {
    return res.status(400).json({ message: "No isSold value provided" });
  }

  console.log(typeof isSold);

  if (typeof isSold !== "boolean") {
    return res.status(400).json({
      message: `isSold must be a boolean. You provided a ${typeof isSold}.`,
    });
  }

  //Update sold status

  let itemUpdated = false;

  fs.createReadStream("./data.csv")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      updatedData = data.map((obj) => {
        if (obj.uid == uid) {
          itemUpdated = true;
          return { ...obj, isSold: isSold };
        }

        return obj;
      });

      //
      if (itemUpdated === false) {
        return res.status(400).json({
          message: `UID does not exist: ${uid}. No data has been updated.`,
        });
      }
      const finalResult = papa.unparse(updatedData);

      function writeToCSVFile(finalResult) {
        const filename = "data.csv";
        fs.writeFile(filename, finalResult, (err) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "Error writing to CSV file" });
          } else {
            console.log(`saved as ${filename}`);
          }
        });
      }

      writeToCSVFile(finalResult);
      return res.status(200).json({ message: "success" });
    });
});

app.get("/api/v1/posts/fetch/csv-data", (req, res) => {
  //Check if API key is valid
  if (process.env.APIKEY !== req.query.apikey) {
    return res.status(401).json({ message: "API Key not authorized" });
  }

  let data = [];

  fs.createReadStream("./data.csv")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      const finalResult = papa.unparse(data);

      return res.status(200).json({ message: "success", csv: finalResult });
    });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
