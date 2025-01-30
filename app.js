const express = require("express");
const {
  getApi,
  getTopics,
  getArticleByID,
  getAllArticles,
  getCommentByArticleID,
  postCommentOnArticle,
} = require("./controllers/controller");
const app = express();

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentByArticleID);
app.post("/api/articles/:article_id/comments", postCommentOnArticle);

app.all("*", (req, res) => {
  res.status(404).send({ err: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ err: "Bad Request" });
  }
  res.status(err.status).send(err);
});

module.exports = app;
