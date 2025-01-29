const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("404: for all bad urls Responds with a message if client gives an endpoint that doesn't exist", () => {
    return request(app)
      .get("/apv")
      .expect(404)
      .then((response) => {
        expect(response.body.err).toBe("Not found");
      });
  });
});
describe("GET /api/topics", () => {
  test("200: Responds with an object detailing all the topics on the endpoint /api/topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(3);
        response.body.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: Responds with if the article positioned at the given article_id", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: Responds with a message if the cilent give an id numebr does not content any data", () => {
    return request(app)
      .get("/api/articles/77")
      .expect(404)
      .then((response) => {
        expect(response.body.err).toEqual("Article not found");
      });
  });
  test("400: Responds with a message bad request when the user doesn't provide a correct id", () => {
    return request(app)
      .get("/api/articles/id")
      .expect(400)
      .then((response) => {
        expect(response.body.err).toEqual("Bad Request");
      });
  });
});
describe("GET /api/articles", () => {
  test("200: respones with an array of articles descending based on time of creation. Does not include body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(13);
        response.body.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
});
describe("Get /api/articles/:articles_id/comments", () => {
  test("200: Responses with all the comments from the request article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("404, If an article has no comments, return 'No comments have been posted'", () => {
    return request(app)
      .get("/api/articles/222/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.err).toEqual("No comments have been posted");
      });
  });
});
