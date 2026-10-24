
const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown.
    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server...`);

      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
