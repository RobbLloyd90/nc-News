const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const format = require("pg-format");
const { createRef } = require("../db/seeds/utils");
const articles = require("../db/data/test-data/articles");

exports.fetchAllTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows: topicRows }) => {
    return topicRows;
  });
};

exports.fetchArticleByID = (id) => {
  const articleIDdNum = id.article_id;

  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1
      GROUP BY articles.article_id`,
      [articleIDdNum]
    )
    .then(({ rows: articleRows }) => {
      return articleRows;
    });
};
exports.fetchAllArticles = (data) => {
  let sortBy = data.query.sort;
  let orderBy = data.query.order;
  let filterByTopic = data.query.topic;
  let queryValues = [];
  let articleStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, articles.alt_img,
      COUNT(comments.article_id)
      AS comment_count FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id`;
  if (filterByTopic !== undefined) {
    return db
      .query(
        `SELECT articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, articles.alt_img,
          COUNT(comments.article_id) 
          AS comment_count FROM articles 
          LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.topic = 'cats'
          GROUP BY articles.article_id ORDER BY articles.created_at ASC;`
      )
      .then(({ rows: topicRows }) => {
        return topicRows;
      })
      .catch((err) => {
        return err;
      });
  }
  if (sortBy !== undefined) {
    if (orderBy === undefined) {
      orderBy = "desc";
    }
    queryValues.push(sortBy + ` ` + orderBy);
    articleStr += ` ORDER BY articles.`;
    return db.query(articleStr + queryValues).then(({ rows: articleRows }) => {
      return articleRows;
    });
  }
  if (sortBy === undefined) {
    if (orderBy === "asc") {
      queryValues.push(orderBy);
      articleStr += ` ORDER BY articles.created_at `;
    }
    if (orderBy === undefined) {
      queryValues.push("desc");
      articleStr += ` ORDER BY articles.created_at `;
    }
  }
  return db
    .query(articleStr + queryValues)
    .then(({ rows: articleRows }) => {
      return articleRows;
    })
    .catch((err) => {
      return err;
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
      if (articleRows.length === 0) {
        return Promise.reject({
          status: 404,
          err: "Not Found",
        });
      }
      if ({ article_id: expect.any(Number) }) {
        if (body.length === 0) {
          return Promise.reject({
            status: 400,
            err: "Cannot post an empty body",
          });
        }

        const articleId = articleRows[0].article_id;
        const data = [body, author, votes, articleId];
        const commentInsertStr = format(
          "INSERT INTO comments (body, author, votes, article_id) VALUES (%L) RETURNING *;",
          data
        );

        return db
          .query(commentInsertStr)
          .then(({ rows: commentRows }) => {
            return commentRows;
          })
          .catch((err) => {
            return Promise.reject({
              status: 404,
              err: "Not Found",
            });
          });
      }
    })
    .catch((err) => {
      return err;
    });
};

exports.fetchVoteOnArticle = (vote, articleId) => {
  if (typeof vote.votes !== "number") {
    return Promise.reject({
      status: 400,
      err: "Bad Request",
    });
  }
  const articleSelectStr = format(
    `SELECT * FROM articles WHERE article_id = $1`
  );
  return db
    .query(articleSelectStr, [articleId])
    .then(({ rows: articleRows }) => {
      if (articleRows.length === 0) {
        return Promise.reject({
          status: 404,
          err: "Not Found",
        });
      }
      const voteUpdateStr = format(
        "UPDATE articles SET votes = votes + (%L) WHERE article_id = $1 RETURNING *",
        [vote.votes]
      );

      return db
        .query(voteUpdateStr, [articleId])
        .then(({ rows: articleRows }) => {
          return articleRows;
        });
    })
    .catch((err) => {
      return err;
    });
};

exports.fetchCommentToDelete = (id) => {
  const commentID = id.comment_id;

  const deleteCommentStr = format(
    "DELETE FROM comments WHERE comment_id = $1 RETURNING *"
  );
  return db
    .query(deleteCommentStr, [commentID])
    .then(({ rows: commentRow }) => {
      if (commentRow.length === 0) {
        return Promise.reject({ status: 404, err: "Not Found" });
      }
      return commentRow;
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, err: "Bad Request" });
      } else return err;
    });
};

exports.fetchAllUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows: UsersRows }) => {
    return UsersRows;
  });
};
