require("dotenv").config({ quiet: true });

const env = require("./config/env");
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const { resetDemoAccount } = require("./services/demoService");

const startServer = async () => {
  await connectDB();

  // On Render's free plan the service sleeps when idle and starts again on the next
  // request, so this puts the public demo account back in shape every so often.
  if (env.RESET_DEMO_ON_START) {
    try {
      const { email } = await resetDemoAccount();
      console.log(`Demo account ${email} reset`);
    } catch (err) {
      console.error("Could not reset the demo account:", err.message);
    }
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  // Render sends SIGTERM on every deploy, let open requests finish first
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

startServer();
