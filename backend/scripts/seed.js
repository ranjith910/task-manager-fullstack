// Creates (or resets) the demo account with sample tasks and activity.
//   pnpm seed
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const env = require("../src/config/env");
const { resetDemoAccount } = require("../src/services/demoService");

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);
  const { email, password, taskCount } = await resetDemoAccount();
  console.log(`Seeded ${taskCount} tasks for ${email} (password: ${password})`);
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
