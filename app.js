const express = require("express");
const {
  getApi,
  getTopics,
  getArticleByID,
  getAllArticles,
  getCommentByArticleID,
} = require("./controllers/controller");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleByID);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentByArticleID);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ err: "Bad Request" });
  }
  res.status(err.status).send(err);
});

app.all("*", (req, res) => {
  res.status(404).send({ err: "Not found" });
});

module.exports = app;
