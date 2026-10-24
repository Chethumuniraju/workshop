const ApiError = require("../utils/ApiError");

// Handle requests that don't match any registered route.
function notFound(req, res, next) {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
}

module.exports = notFound;