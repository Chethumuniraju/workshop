const env = require("../config/env");

// Centralized Express error-handling middleware.
function errorHandler(err, req, res, next) {
  // Use the status code provided by the error, or default to 500.
  const statusCode = err.statusCode || 500;

  // Build a consistent error response.
  const response = {
    success: false,
    message: err.message || "Internal server error"
  };

  // Include validation details when available.
  if (err.details) {
    response.details = err.details;
  }

  // Include stack traces only during development.
  if (env.nodeEnv === "development") {
    response.stack = err.stack;
  }

  // Send the error response to the client.
  res.status(statusCode).json(response);
}

module.exports = errorHandler;