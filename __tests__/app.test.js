const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const express = require("express");
const db = require("../db/connection");
const app = require("../app");
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */

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
        console.log(response.body);
        expect(response.body.error).toBe("Endpoint not found");
      });
  });
});
describe("GET /api/topics", () => {
  test("200: Responds with an obejct detailing all the topics on the endpoint /api/topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        console.log(response.body);
        expect(response.body).toEqual(
          endpointsJson["GET /api/topics"].exampleResponse.topics
        );
      });
  });
  test("404: Responds with a message if the cilent gives an ID which does not exist in the database", () => {
    return request(app)
      .get("/api/tipics")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Endpoint not found");
      });
  });
});

//BELOW is setup for a 400 status code
// test("400: Responds with 'Bad Request' if the client gives an non numberd category ID", () => {
//   return request(app)
//     .get("/api/topics/?cheesecake")
//     .expect(400)
//     .then((response) => {
//       expect(response.body.error).toBe("Bad Request");
//     });
