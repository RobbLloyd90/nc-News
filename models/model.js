const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const format = require("pg-format");
const { createRef } = require("../db/seeds/utils");
const articles = require("../db/data/test-data/articles");

exports.fetchAllTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleByID = (id) => {
  const articleIDdNum = id.article_id;

  return db
    .query(
      `SELECT * FROM articles 
      WHERE article_id = $1`,
      [articleIDdNum]
    )
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
    .then(({ rows: articleRows }) => {
      return articleRows;
    });
};

exports.fetchCommentsByArticleID = (id) => {
  const articleIdNum = id.article_id;
  return db
    .query(
      `SELECT * FROM comments 
      WHERE article_id = $1 
      ORDER BY comments.created_at 
      DESC`,
      [articleIdNum]
    )
    .then(({ rows: articlesRows }) => {
      return articlesRows;
    });
};

exports.fetchPostCommentOnArticle = (
  { body, author, votes },
  { article_id }
) => {
  const articleSelectStr = format(
    `SELECT * FROM articles WHERE article_id = $1`
  );
  return db
    .query(articleSelectStr, [article_id])
    .then(({ rows: articleRows }) => {
      if ({ article_id: expect.any(Number) }) {
        const articleId = articleRows[0].article_id;
        const data = [body, author, votes, articleId];

        const commentInsertStr = format(
          "INSERT INTO comments (body, author, votes, article_id) VALUES (%L) RETURNING *;",
          data
        );

        return db
          .query(commentInsertStr)
          .then(({ rows: commentRows }) => {
            if (commentRows[0].body.length > 0) {
              return commentRows;
            }
            return Promise.reject({
              status: 400,
              err: "Cannot post an empty body",
            });
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    })
    .catch((err) => {
      return err;
    });
};
