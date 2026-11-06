const { app, request, createLoggedInUser } = require("./helpers");
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/User");

const newUser = { name: "Ranjith", email: "ranjith@example.com", password: "password123" };

const getCookie = (res) => res.headers["set-cookie"]?.find((c) => c.startsWith("token="));

describe("POST /api/auth/register", () => {
  it("creates the user, hashes the password and sets an httpOnly cookie", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser).expect(201);

    const { name, email, role, password } = res.body.data;
    assert.deepEqual(
      { name, email, role },
      { name: "Ranjith", email: "ranjith@example.com", role: "user" },
    );
    assert.equal(password, undefined);
    assert.match(getCookie(res), /HttpOnly/i);

    const saved = await User.findOne({ email: newUser.email }).select("+password");
    assert.notEqual(saved.password, newUser.password);
    assert.equal(await saved.comparePassword(newUser.password), true);
  });

  it("rejects an email that is already registered (case-insensitive)", async () => {
    await request(app).post("/api/auth/register").send(newUser).expect(201);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, email: "RANJITH@example.com" })
      .expect(409);

    assert.equal(res.body.errors[0].field, "email");
  });

  it("returns field errors for invalid input", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "R", email: "not-an-email", password: "short" })
      .expect(400);

    const fields = res.body.errors.map((e) => e.field);
    for (const field of ["name", "email", "password"]) {
      assert.ok(fields.includes(field), `expected an error for ${field}`);
    }
  });

  it("does not let the client choose its own role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, role: "admin" })
      .expect(400);

    assert.equal(res.body.errors[0].field, "role");
    assert.equal(await User.countDocuments(), 0);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(newUser).expect(201);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password })
      .expect(200);

    assert.equal(res.body.data.email, newUser.email);
    assert.ok(getCookie(res));
  });

  it("gives the same error for a wrong password and an unknown email", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "wrongpass1" })
      .expect(401);
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass1" })
      .expect(401);

    assert.equal(wrongPassword.body.message, "Invalid email or password");
    assert.equal(unknownEmail.body.message, wrongPassword.body.message);
    assert.equal(getCookie(wrongPassword), undefined);
  });
});

describe("session", () => {
  it("GET /me needs a valid session", async () => {
    await request(app).get("/api/auth/me").expect(401);
    await request(app).get("/api/auth/me").set("Cookie", "token=garbage").expect(401);
  });

  it("GET /me returns the logged in user", async () => {
    const { agent } = await createLoggedInUser({ name: "Asha" });
    const res = await agent.get("/api/auth/me").expect(200);
    assert.equal(res.body.data.name, "Asha");
  });

  it("also accepts a Bearer token (for Postman)", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser);
    const token = getCookie(res).split(";")[0].replace("token=", "");

    await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  });

  it("logout clears the cookie", async () => {
    const { agent } = await createLoggedInUser();
    const res = await agent.post("/api/auth/logout").expect(200);

    assert.match(getCookie(res), /Expires=Thu, 01 Jan 1970/);
    await agent.get("/api/auth/me").expect(401);
  });
});

describe("PATCH /api/auth/me", () => {
  it("updates the name", async () => {
    const { agent } = await createLoggedInUser();
    const res = await agent.patch("/api/auth/me").send({ name: "New Name" }).expect(200);
    assert.equal(res.body.data.name, "New Name");
  });

  it("refuses an email that belongs to someone else", async () => {
    await createLoggedInUser({ email: "taken@example.com" });
    const { agent } = await createLoggedInUser();

    await agent.patch("/api/auth/me").send({ email: "taken@example.com" }).expect(409);
  });
});

describe("PATCH /api/auth/password", () => {
  it("requires the correct current password", async () => {
    const { agent } = await createLoggedInUser();
    const res = await agent
      .patch("/api/auth/password")
      .send({ currentPassword: "wrongpass1", newPassword: "newpassword1" })
      .expect(400);

    assert.equal(res.body.errors[0].field, "currentPassword");
  });

  it("changes the password and invalidates older sessions", async () => {
    const { agent, credentials } = await createLoggedInUser();

    // second session for the same user, like another browser
    const otherSession = request.agent(app);
    await otherSession
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    // JWT iat only has 1 second precision
    await new Promise((resolve) => setTimeout(resolve, 1100));

    await agent
      .patch("/api/auth/password")
      .send({ currentPassword: credentials.password, newPassword: "newpassword1" })
      .expect(200);

    await agent.get("/api/auth/me").expect(200);
    await otherSession.get("/api/auth/me").expect(401);

    await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "newpassword1" })
      .expect(200);
  });
});
