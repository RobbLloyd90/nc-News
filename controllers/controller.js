const { selectApiContents } = require("../models/model");
const endpoints = require("../endpoints.json");
const regexIDNumsCheck = /\d+s/;

exports.getApi = (req, res, next) => {
  console.log(res.body);
  res.status(200).send({ endpoints });
};

exports.getTopics = (req, res, next) => {
  console.log("200 here");
  res.status(200).send(endpoints["GET /api/topics"].exampleResponse.topics);
};

// console.log(regexIDNumsCheck.test(req.query));

// if (regexIDNumsCheck.test(req.query) === false) {
//   next();
// }
