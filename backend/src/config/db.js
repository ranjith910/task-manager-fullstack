const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const disconnectDB = () => mongoose.disconnect();

module.exports = { connectDB, disconnectDB };
