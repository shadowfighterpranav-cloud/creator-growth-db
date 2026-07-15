const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
// 1. CONNECT TO YOUR CLOUD DATABASE
// Replace <PASSWORD> with your actual database user password
// Change 'natours' to 'creator-growth' right before the question mark
const DB = process.env.DATABASE;
mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});
const port = 8000;
app.listen(port, () => {
  console.log("Server running on port 3000");
});
