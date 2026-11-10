// The limiters are switched off in the other test files. This file turns them on, and
// trusts one proxy hop so we can fake client IPs with X-Forwarded-For like an attacker would.
process.env.TEST_RATE_LIMITS = "true";
process.env.TRUST_PROXY = "1";

const { app, request, createLoggedInUser } = require("./helpers");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const loginFrom = (ip, email, password) =>
  request(app).post("/api/auth/login").set("X-Forwarded-For", ip).send({ email, password });

describe("rate limits", () => {
  it("blocks password guessing on one account even when the IP keeps changing", async () => {
    const { credentials } = await createLoggedInUser();

    for (let i = 1; i <= 10; i += 1) {
      await loginFrom(`10.0.0.${i}`, credentials.email, "wrongpass1").expect(401);
    }

    // the right password from yet another IP is still refused for now
    const blocked = await loginFrom("10.0.0.99", credentials.email, credentials.password);
    assert.equal(blocked.status, 429);

    // other accounts are not affected
    const other = await createLoggedInUser();
    await loginFrom("10.0.1.1", other.credentials.email, other.credentials.password).expect(200);
  });

  it("limits wrong current passwords per user", async () => {
    const { agent } = await createLoggedInUser();
    const attempt = () =>
      agent
        .patch("/api/auth/password")
        .send({ currentPassword: "wrongpass1", newPassword: "newpassword1" });

    for (let i = 0; i < 5; i += 1) {
      await attempt().expect(400);
    }
    await attempt().expect(429);
  });
});
