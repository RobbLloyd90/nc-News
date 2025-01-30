const {
  fetchAllTopics,
  fetchArticleByID,
  fetchAllArticles,
  fetchCommentsByArticleID,
  fetchPostCommentOnArticle,
} = require("../models/model");
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
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  fetchAllArticles()
    .then((allArticles) => {
      res.status(200).send(allArticles);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentByArticleID = (req, res, next) => {
  const articleId = req.params;
  fetchCommentsByArticleID(articleId)
    .then((commentsToSend) => {
      if (commentsToSend.length === 0) {
        return Promise.reject({
          status: 404,
          err: "No comments have been posted",
        });
      }
      res.status(200).send(commentsToSend);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentOnArticle = (req, res, next) => {
  const newComment = req.body;
  const articleId = req.params;
  fetchPostCommentOnArticle(newComment, articleId).then((commentPosted) => {
    if (commentPosted.code === "23503" || commentPosted.status === 400) {
      next(commentPosted);
    }
    res.status(201).send(commentPosted[0]);
  });
};
