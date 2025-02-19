const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const articles = require("../db/data/test-data/articles");
const { string } = require("pg-format");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});
describe("APP.GET / GET REQUESTS", () => {
  describe("GET avaibale API endpoints", () => {
    test("200: Responds with an object detailing the documentation for each endpoint", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsJson);
        });
    });
    test("404: Responds with a message for all bad URLs", () => {
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
    test("404: Responds with 'Article not found' if the cilent give an id numebr does not content any data", () => {
      return request(app)
        .get("/api/articles/77")
        .expect(404)
        .then((response) => {
          expect(response.body.err).toEqual("Article not found");
        });
    });
    test("400: Responds with 'Bad Request' when the user doesn't provide a correct id", () => {
      return request(app)
        .get("/api/articles/id")
        .expect(400)
        .then((response) => {
          expect(response.body.err).toEqual("Bad Request");
        });
    });
  });
  describe.only("GET /api/articles", () => {
    test("200: Respones with an array of articles descending based on time of creation. Does not include body property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          const articleCreationTimeStamp = response.body.map(
            (body) => body.created_at
          );

          expect(articleCreationTimeStamp).toBeSorted({ descending: true });
          expect(response.body.length).toBe(13);
          response.body.forEach((article) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
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
          const commentCreationTimeStamp = response.body.map(
            (body) => body.created_at
          );
          expect(commentCreationTimeStamp).toBeSorted({ descending: true });

          expect(response.body.length).toBe(11);
          response.body.forEach((body) => {
            expect(body).toMatchObject({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(String),
            });
          });
        });
    });
    test("200: Responds with 'No comments have been posted' if an article has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(404)
        .then((response) => {
          expect(response.body.err).toEqual("No comments have been posted");
        });
    });
    test("400: Responds with 'Bad Request' when user give an invalid id", () => {
      return request(app)
        .get("/api/articles/id/comments")
        .expect(400)
        .then((response) => {
          expect(response.body.err).toEqual("Bad Request");
        });
    });
  });
});
describe("APP.POST", () => {
  describe("POST REQUEST", () => {
    test("201: Returns a new posted comment", () => {
      const newComment = {
        author: "al-dente",
        body: "This article feels half done",
        votes: 0,
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201)
        .then((respones) => {
          expect(respones.body.author).toBe("al-dente");
          expect(respones.body.body).toBe("This article feels half done");
        });
    });
    test("404: Returns a 'Not Found' if no user exists in the user database", () => {
      const newComment = {
        author: "Caabi Nara",
        body: "In Japan Spagehtti is the fourth type of noodle",
        votes: 0,
      };

      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(404)
        .then((response) => {
          expect(response.body.err).toEqual("Not Found");
        });
    });
    test("400: Returns a 'Bad Request' when the user sends an empty object", () => {
      const newComment = {
        author: "al-dente",
        body: [],
        votes: 0,
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then((response) => {
          expect(response.body.err).toEqual("Cannot post an empty body");
        });
    });
    test("404: Returns 'Not Found' if the article doesn't exist", () => {
      const newComment = {
        author: "al-dente",
        body: "This article feels half done",
        votes: 0,
      };

      return request(app)
        .post("/api/articles/53/comments")
        .send(newComment)
        .expect(404)
        .then((respones) => {
          expect(respones.body.err).toEqual("Not Found");
        });
    });
    test("400: Returns 'Bad Request' if the id is invalid, Not a number", () => {
      const newComment = {
        author: "al-dente",
        body: "This article feels half done",
        votes: 0,
      };

      return request(app)
        .post("/api/articles/pastaMaster/comments")
        .send(newComment)
        .expect(400)
        .then((respones) => {
          expect(respones.body.err).toEqual("Bad Request");
        });
    });
  });
  describe("PATCH REQUESTS", () => {
    test("203: Increase the vote count by 1 when one is passed", () => {
      const article = {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1594329060000,
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };

      const voteUpdate = { votes: 1 };

      return request(app)
        .post("/api/articles/1")
        .send(voteUpdate)
        .expect(203)
        .then((respones) => {
          expect(respones.body[0].votes).toBe(101);
          expect(respones.body[0].article_id).toBe(1);
        });
    });
    test("203: Decrease the vote count by 1 when one is passed", () => {
      const article = {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1594329060000,
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };

      const voteUpdate = { votes: -50 };

      return request(app)
        .post("/api/articles/1")
        .send(voteUpdate)
        .expect(203)
        .then((respones) => {
          expect(respones.body[0].votes).toBe(50);
          expect(respones.body[0].article_id).toBe(1);
        });
    });
    test("400: Returns 'Bad Request' if the vote isn't a number", () => {
      const voteUpdate = { votes: "notValid" };
      return request(app)
        .post("/api/articles/99")
        .send(voteUpdate)
        .expect(400)
        .then((respones) => {
          expect(respones.body.err).toBe("Bad Request");
        });
    });
    test("404: Returns 'Not Found' if the article doesn't exist", () => {
      const voteUpdate = { votes: 1 };
      return request(app)
        .post("/api/articles/99")
        .send(voteUpdate)
        .expect(404)
        .then((respones) => {
          expect(respones.body.err).toEqual("Not Found");
        });
    });
    test("400: Returns 'Bad Request' if the ID is invalid, Not a number", () => {
      const voteUpdate = { votes: 1 };

      return request(app)
        .post("/api/articles/bowTiesVsPenne")
        .send(voteUpdate)
        .expect(400)
        .then((respones) => {
          expect(respones.body.err).toEqual("Bad Request");
        });
    });
  });
});
describe("APP.DELETE / DELETE REQUESTS", () => {
  test("204: Deletes a comment from the databased from its comment_id", () => {
    return request(app).delete("/api/comments/4").expect(204);
  });

  test("400: Returns 'Bad Request' if comment_id is invalid, Not a number", () => {
    return request(app)
      .delete("/api/comments/101 sauaces for your pasta")
      .expect(400)
      .then((response) => {
        expect(response.body.err).toEqual("Bad Request");
      });
  });
  test("404: Returns 'Not Found' if the comment_id doesn't exist on the database", () => {
    return request(app)
      .delete("/api/comments/101")
      .expect(404)
      .then((response) => {
        expect(response.body.err).toEqual("Not Found");
      });
  });
});
describe("USERS", () => {
  describe("APP.GET USERS", () => {
    test("200: Return all abailable user", () => {
      const user = {
        username: "Lin-Manguine Marinara",
        name: "Lin Manuel Miranda",
        avatar_url:
          "https://en.wikipedia.org/wiki/Lin-Manuel_Miranda#/media/File:Lin-Manuel_Miranda_in_Hamilton.jpg",
      };
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((response) => {
          expect(response.body.length).toBe(7);
          response.body.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
    test("404: Return 'Not found' if the URL is not valid", () => {
      return request(app)
        .get("/api/use")
        .expect(404)
        .then((response) => {
          expect(response.body.err).toEqual("Not found");
        });
    });
  });
  describe("Qurries", () => {
    test("200: If no queries given respones with an array of articles descending based on time of creation. Does not include body property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          const articleCreationTimeStamp = response.body.map(
            (body) => body.created_at
          );

          expect(articleCreationTimeStamp).toBeSorted({ descending: true });

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
    test("200: change the order between ascending and decsending", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then((response) => {
          const articleCreationTimeStamp = response.body.map(
            (body) => body.created_at
          );

          expect(articleCreationTimeStamp).toBeSorted({ ascending: true });

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
    test("200: change the sort articles by any valid column", () => {
      return request(app)
        .get("/api/articles?sort=title&order=asc")
        .expect(200)
        .then((response) => {
          const sortByCheck = response.body.map((body) => body.title);

          expect(sortByCheck).toBeSorted({ ascending: true });

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
    test("200: api/articles - topic query", () => {
      return request(app)
        .get("/api/articles?topic=cat")
        .expect(200)
        .then((response) => {
          expect(response.body.length).toBe(1);
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
    test("200 - article id with comment count", () => {
      return request(app)
        .get("/api/articles/1")
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
            comment_count: expect.any(String),
          });
        });
    });
  });
});
