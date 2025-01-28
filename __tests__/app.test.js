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
  test("404: Responds with a message if client give invalid pathway", () => {
    return request(app)
      .get("/apv")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found");
      });
  });
});
describe("GET /api/topics", () => {
  test("200: Responds with an object detailing all the topics on the endpoint /api/topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        console.log(response.body.length);
        expect(response.body.length).toBe(3);
        response.body.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
  test("404: Responds with a message if the cilent gives an incorrect pathway which does not exist", () => {
    return request(app)
      .get("/api/tipics")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found");
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
});
