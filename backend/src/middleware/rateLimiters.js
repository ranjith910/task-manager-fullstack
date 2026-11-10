const { rateLimit } = require("express-rate-limit");
const env = require("../config/env");

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// off in tests, except in the test file that checks the limits themselves
const skip = () => env.isTest && process.env.TEST_RATE_LIMITS !== "true";

const limiter = (options) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip,
    ...options,
  });

// each page view is a few requests, and every change refetches what's on screen
const apiLimiter = limiter({
  limit: 1000,
  message: { success: false, message: "Too many requests, please try again later" },
});

// Login and register, per IP. Only failed requests count, so normal use never gets near it.
const authLimiter = limiter({
  limit: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

// Failed logins per account. The IP can be faked by calling the API directly with a made up
// X-Forwarded-For header, the email can't, so this caps password guessing on one account.
const loginAccountLimiter = limiter({
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "",
  message: {
    success: false,
    message: "Too many failed logins for this account, please try again in 15 minutes",
  },
});

// wrong current password attempts, per logged in user (runs after protect)
const passwordChangeLimiter = limiter({
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.user.id,
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

module.exports = { apiLimiter, authLimiter, loginAccountLimiter, passwordChangeLimiter };
