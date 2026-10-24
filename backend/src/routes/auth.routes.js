
const express = require("express");

const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/authenticate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { authController } = require("../container");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

// GET /api/auth/me
// Return the safe profile for the authenticated user.
router.get(
  "/me",
  authenticate,
  authController.me
);

module.exports = router;
