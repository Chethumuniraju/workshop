const ApiError = require("../utils/ApiError");

// Accept the roles allowed to access a route.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    // Authentication middleware must run before authorization.
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required")
      );
    }

    // Check whether the authenticated user has an allowed role.
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }

    // The user is authenticated and has the required role.
    next();
  };
}

module.exports = authorize;