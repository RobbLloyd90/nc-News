const express = require("express");
const endpoints = require("./endpoints.json");
const app = express();

app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});
module.exports = app;
