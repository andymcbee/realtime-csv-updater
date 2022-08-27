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

app.post("/update-post", (req, res) => {
  data = [];
  console.log("UPDATE POST ENDPOINT WAS HIT.");
  console.log("DATA PROVIDED VIA POST REQUEST:::::::");
  console.log(req.body);
  //uid provided by post request
  const uid = req.body.uid;
  console.log(uid);

  //new name to use when updating CSV
  const name = req.body.updatedName;
  console.log(name);

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
          return { ...obj, name: name };
        }

        return obj;
      });
      console.log("UPDATED CSV DATA:::::::");

      console.log(updatedData);

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
      res.status(200).json({ message: "success" });
    });
});

app.get("/updated-csv", (req, res) => {
  let data = [];

  fs.createReadStream("./data.csv")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      console.log("ORIGINAL DATA FROM CSV FILE:::::::");
      console.log(data);

      const finalResult = papa.unparse(data);

      console.log(finalResult);
      res.status(200).json({ csv: finalResult });
    });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
/*
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}.`);
});

/* const fs = require("fs");
const csv = require("fast-csv");
//array that will contain all objects from the CSV
const data = [];
let updatedData = [];

// read CSV file stored on node server

fs.createReadStream("./data.csv")
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => data.push(row))
  .on("end", () => {
    console.log("ORIGINAL DATA FROM CSV FILE:::::::");
    console.log(data);
    //  const result = words.filter(word => word.length > 6);

    updatedData = data.map((obj) => {
      if (obj.uid == 111) {
        return { ...obj, name: "NEWNAME" };
      }

      return obj;
    });
    console.log("UPDATED CSV DATA:::::::");

    console.log(updatedData);
  }); */
