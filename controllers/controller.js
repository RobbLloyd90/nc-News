const { fetchAllTopics, fetchArticleByID } = require("../models/model");
const endpoints = require("../endpoints.json");
//const regexIDNumsCheck = /\d+s/;

exports.getApi = (req, res, next) => {
  console.log(res.body);
  res.status(200).send({ endpoints });
};

exports.getTopics = (req, res, next) => {
  fetchAllTopics()
    .then((allTopics) => {
      res.send(allTopics);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleByID = (req, res, next) => {
  //console.log(req.params);
  const articleId = req.params;
  fetchArticleByID(articleId)
    .then((articleToSend) => {
      res.status(200).send(articleToSend);
    })
    .catch(next);
};
//BELOW is code when trying to write for 400 status code. Might be useful later
// console.log(regexIDNumsCheck.test(req.query));

// if (regexIDNumsCheck.test(req.query) === false) {
// next();
