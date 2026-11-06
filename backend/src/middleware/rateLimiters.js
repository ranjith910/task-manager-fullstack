const { rateLimit } = require("express-rate-limit");
const env = require("../config/env");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { success: false, message: "Too many requests, please try again later" },
});

// login/register only. successful logins don't count towards the limit,
// so it only really slows down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => env.isTest,
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

module.exports = { apiLimiter, authLimiter };
