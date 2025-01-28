const express = require("express");
//const endpoints = require("./endpoints.json");
const {
  getApi,
  getTopics,
  getArticleByID,
} = require("./controllers/controller");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleByID);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Not found" });
});

module.exports = app;
