const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const csv = require("fast-csv");
const papa = require("papaparse");

//array that will contain all objects from the CSV
let data = [];

let updatedData = [];

const app = express();
const port = 3000;

// Where we will keep books
let books = [];

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/v1/update/sold-status", (req, res) => {
  data = [];
  console.log("UPDATE POST ENDPOINT WAS HIT.");
  console.log("DATA PROVIDED VIA POST REQUEST:::::::");
  console.log(req.body);
  //uid provided by post request
  const uid = req.body.uid;
  const isSold = req.body.isSold;

  console.log(uid);

  //handle errors

  if (!uid) {
    console.log("No UID provided.");
    return res.status(200).json({ message: "No UID provided" });
  }

  if (isSold === undefined) {
    console.log("No isSold value provided.");
    return res.status(200).json({ message: "No isSold value provided" });
  }

  console.log(typeof isSold);

  if (typeof isSold !== "boolean") {
    console.log(`isSold must be a boolean. You provided a ${typeof isSold}.`);
    return res.status(200).json({
      message: `isSold must be a boolean. You provided a ${typeof isSold}.`,
    });
  }

  //Update sold status

  console.log(isSold);

  let itemUpdated = false;

  fs.createReadStream("./data.csv")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      console.log("ORIGINAL DATA FROM CSV FILE:::::::");
      console.log(data);
      //  const result = words.filter(word => word.length > 6);

      updatedData = data.map((obj) => {
        if (obj.uid == uid) {
          itemUpdated = true;
          return { ...obj, isSold: isSold };
        }

        return obj;
      });

      //
      if (itemUpdated === false) {
        console.log(`UID does not exist: ${uid}. No data has been updated.`);
        return res.status(200).json({
          message: `UID does not exist: ${uid}. No data has been updated.`,
        });
      }

      console.log("ITEM UPDATED");
      console.log(itemUpdated);
      console.log("UPDATED CSV DATA:::::::");

      console.log(updatedData);

      console.log(data == updatedData);

      console.log("UPDATED CSV IN COMMA FORMAT::::");

      const finalResult = papa.unparse(updatedData);

      console.log(finalResult);

      function writeToCSVFile(finalResult) {
        const filename = "data.csv";
        fs.writeFile(filename, finalResult, (err) => {
          if (err) {
            console.log("Error writing to csv file", err);
          } else {
            console.log(`saved as ${filename}`);
          }
        });
      }

      writeToCSVFile(finalResult);
      return res.status(200).json({ message: "success" });
    });
});

app.get("/api/v1/fetch/csv-data", (req, res) => {
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
