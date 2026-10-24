class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    // Initialize the built-in Error with the message.
    super(message);

    // Set the error name for debugging.
    this.name = "ApiError";

    // Store the HTTP status code (e.g., 400, 401, 404).
    this.statusCode = statusCode;

    // Store optional extra details, such as Joi validation messages.
    this.details = details;

    // Capture the correct stack trace for this custom error.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;