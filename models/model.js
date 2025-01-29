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
      return result.rows;
    });
};
exports.fetchAllArticles = () => {
  return db
    .query(
      `SELECT articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, 
      COUNT(comments.article_id) 
      AS comment_count FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id 
      ORDER BY articles.created_at DESC;`
    )
    .then((result) => {
      return result.rows;
    });
};
