const { fetchAllTopics, fetchArticleByID } = require("../models/model");
const endpoints = require("../endpoints.json");

exports.getApi = (req, res, next) => {
  res.status(200).send({ endpoints });
};

exports.getTopics = (req, res, next) => {
  fetchAllTopics()
    .then((allTopics) => {
      res.status(200).send(allTopics);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleByID = (req, res, next) => {
  const articleId = req.params;
  fetchArticleByID(articleId)
    .then((articleToSend) => {
      if (articleToSend.length === 0) {
        return Promise.reject({ status: 404, err: "Article not found" });
      }
      res.status(200).send(articleToSend[0]);
    })
    .catch((err) => {
      console.log(err.code);
      next(err);
    });
};
