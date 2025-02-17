const {
  fetchAllTopics,
  fetchArticleByID,
  fetchAllArticles,
  fetchCommentsByArticleID,
  fetchPostCommentOnArticle,
  fetchVoteOnArticle,
  fetchCommentToDelete,
  fetchAllUsers,
} = require("../models/model");
const endpoints = require("../endpoints.json");
const { rawListeners } = require("../app");

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
  fetchAllArticles(req)
    .then((allArticlesFetched) => {
      res.status(200).send(allArticlesFetched);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentByArticleID = (req, res, next) => {
  const articleId = req.params;
  fetchCommentsByArticleID(articleId)
    .then((allCommentsFetched) => {
      if (allCommentsFetched.length === 0) {
        return Promise.reject({
          status: 404,
          err: "No comments have been posted",
        });
      }
      res.status(200).send(allCommentsFetched);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentOnArticle = (req, res, next) => {
  const newComment = req.body;
  const articleId = req.params;
  fetchPostCommentOnArticle(newComment, articleId).then((newCommentFetched) => {
    if (
      newCommentFetched.code === "23503" ||
      newCommentFetched.code === "22P02" ||
      newCommentFetched.status === 404 ||
      newCommentFetched.status === 400
    ) {
      next(newCommentFetched);
    }
    res.status(201).send(newCommentFetched[0]);
  });
};

exports.voteOnArticle = (req, res, next) => {
  const newVote = req.body;
  const articleId = req.params.article_id;
  fetchVoteOnArticle(newVote, articleId)
    .then((votesFetched) => {
      if (votesFetched.code === "22P02") {
        next(votesFetched);
      }
      if (votesFetched.status === 404) {
        next(votesFetched);
      }
      res.status(203).send(votesFetched);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  fetchCommentToDelete(req.params)
    .then((results) => {
      if (results.status === 404) {
        next(results);
      } else res.status(204).send(results.rows);
    })
    .catch((err) => {
      next(err);
    });
};
exports.getUsers = (req, res, next) => {
  fetchAllUsers()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      next(err);
    });
};
