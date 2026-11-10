const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing env variables: ${missing.join(", ")} (see backend/.env.example)`);
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET should be at least 32 characters in production");
}

// accepts "true", "false", a number of proxy hops, or anything express understands
const parseTrustProxy = (value) => {
  if (!value) return isProduction ? 1 : false;
  if (value === "true") return true;
  if (value === "false") return false;
  return Number.isInteger(Number(value)) ? Number(value) : value;
};

module.exports = {
  NODE_ENV,
  isProduction,
  isTest: NODE_ENV === "test",
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URLS: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),
  // shared demo login: created/reset by services/demoService.js, locked in authController
  DEMO_EMAIL: (process.env.DEMO_EMAIL || "demo@tasknix.app").toLowerCase(),
  DEMO_PASSWORD: process.env.DEMO_PASSWORD || "demo1234",
  RESET_DEMO_ON_START: process.env.RESET_DEMO_ON_START === "true",
};
