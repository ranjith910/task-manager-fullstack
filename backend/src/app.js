const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// needed behind Render/Vercel so req.ip (used by the rate limiter) is the real client ip
app.set("trust proxy", env.TRUST_PROXY);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URLS, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

if (!env.isTest) {
  app.use(morgan(env.isProduction ? "combined" : "dev"));
}

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Tasknix API is running" });
});

app.get("/api/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    database: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
