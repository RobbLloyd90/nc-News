const express = require("express");
const endpoints = require("./endpoints.json");
const app = express();
const { getApi, getTopics } = require("./controllers/controller");

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

// app.use((err, req, res, next) => {
//   console.log("in the next block");
//   res.status(400).send({ error: "Bad Request" });
// });

app.all("*", (req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});
module.exports = app;
