
const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
}

module.exports = { connectDatabase };
