import { describe, expect, it, afterAll } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();
afterAll(() => app.close());

describe("GET /:size", () => {
  it("serves an svg for 640x360", async () => {
    const res = await app.inject({ url: "/640x360" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("image/svg+xml");
    expect(res.headers["cache-control"]).toContain("max-age=86400");
    expect(res.body).toContain('width="640"');
  });

  it("supports custom text and colors", async () => {
    const res = await app.inject({
      url: "/300x200",
      query: { text: "Hero", bg: "#123456", fg: "#fedcba" },
    });
    expect(res.body).toContain("Hero");
    expect(res.body).toContain("#123456");
    expect(res.body).toContain("#fedcba");
  });

  it("escapes malicious text", async () => {
    const res = await app.inject({
      url: "/300x200",
      query: { text: "<script>x</script>" },
    });
    expect(res.body).not.toContain("<script>x");
  });

  it("rejects invalid sizes", async () => {
    const res = await app.inject({ url: "/abc" });
    expect(res.statusCode).toBe(400);
  });

  it("rejects bad colors", async () => {
    const res = await app.inject({ url: "/300x200", query: { bg: "blue" } });
    expect(res.statusCode).toBe(400);
  });
});

describe("meta", () => {
  it("health is reachable despite parametric route", async () => {
    const res = await app.inject({ url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("ok");
  });

  it("root describes the service", async () => {
    const res = await app.inject({ url: "/" });
    expect(res.json().service).toBe("placeholder-service");
  });
});
