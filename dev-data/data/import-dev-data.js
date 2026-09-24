const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Creator = require("../../models/creatorModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful for seeding!"));

// Read JSON file
const creators = JSON.parse(
  fs.readFileSync(`${__dirname}/creators.json`, "utf-8"),
);

// Import data into DB
const importData = async () => {
  try {
    await Creator.deleteMany();
    await Creator.create(creators);
    console.log("Sample Data Successfully Loaded!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Delete data from DB
const deleteData = async () => {
  try {
    await Creator.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  importData();
}
