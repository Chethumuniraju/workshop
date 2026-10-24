const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");

// Verify the JWT and attach the authenticated user to the request.
const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  // Require the Authorization header in Bearer token format.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token is required");
  }

  // Extract the token after "Bearer ".
  const token = authorization.split(" ")[1];

  let decoded;

  try {
    // Verify the token's signature and expiration.
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  // Find the user identified by the token.
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "User associated with token no longer exists");
  }

  // Make the authenticated user's information available to later middleware.
  req.user = user;

  // Continue to the next middleware or controller.
  next();
});

module.exports = authenticate;