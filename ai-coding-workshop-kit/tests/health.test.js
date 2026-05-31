const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  test("returns ok true", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
    });
  });
});
