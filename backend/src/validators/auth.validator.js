const Joi = require("joi");

// Validation rules for user registration.
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().lowercase().required(),

  password: Joi.string().min(8).max(128).required(),

  role: Joi.string().valid("user", "admin")
});

// Validation rules for user login.
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),

  password: Joi.string().required()
});

// Export the schemas so the validation middleware can use them.
module.exports = {
  registerSchema,
  loginSchema
};