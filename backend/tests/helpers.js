// This has to run before the app is loaded so config/env.js picks it up.
// MONGO_URI_TEST can come from the shell or backend/.env. Only that one value is read
// from the file, so the tests can never touch the dev database in MONGO_URI.
const fromEnvFile = {};
require("dotenv").config({ quiet: true, processEnv: fromEnvFile });

process.env.NODE_ENV = "test";
process.env.MONGO_URI =
  process.env.MONGO_URI_TEST || fromEnvFile.MONGO_URI_TEST || "mongodb://127.0.0.1:27017";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-the-tests";
process.env.JWT_EXPIRES_IN = "1h";

// node --test runs every file in its own process, so each file gets its own database
const dbName = `tasknix_test_${process.pid}`;

const { before, afterEach, after } = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");

before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName });
  // build the unique email index before any test depends on it
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

let userCount = 0;

// registers a user and returns an agent that keeps the auth cookie
const createLoggedInUser = async (overrides = {}) => {
  userCount += 1;
  const credentials = {
    name: "Test User",
    email: `user${userCount}@example.com`,
    password: "password123",
    ...overrides,
  };

  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send(credentials).expect(201);

  return { agent, user: res.body.data, credentials };
};

const createTask = async (agent, fields = {}) => {
  const res = await agent
    .post("/api/tasks")
    .send({ title: "Test task", dueDate: "2026-12-01", ...fields })
    .expect(201);
  return res.body.data;
};

module.exports = { app, request, createLoggedInUser, createTask };
