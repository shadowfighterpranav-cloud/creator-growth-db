const express = require("express");
const app = express();
const creatorRouter = require("./routes/creatorRoutes");

app.use(express.json());

app.use("/api/v1/creators", creatorRouter);

app.set("query parser", "extended");
module.exports = app;
