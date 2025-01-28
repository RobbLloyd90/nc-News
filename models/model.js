const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const format = require("pg-format");

exports.fetchAllTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleByID = (id) => {
  const idNum = id.article_id;

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [idNum])
    .then((result) => {
      return result.rows[0];
    });
};
