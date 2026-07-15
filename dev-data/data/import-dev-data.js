const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Creator = require("./../../models/creatorModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful for scripting!"));

// READ JSON FILE
const creators = JSON.parse(
  fs.readFileSync(`${__dirname}/creators.json`, "utf-8"),
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Creator.create(creators);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Creator.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// FLAG CHECKS FROM TERMINAL COMMAND
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
