
require("dotenv").config();

const Joi = require("joi");

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  PORT: Joi.number()
    .port()
    .default(5000),

  MONGODB_URI: Joi.string()
    .required(),

  JWT_SECRET: Joi.string()
    .min(32)
    .required(),

  CLIENT_URL: Joi.string()
    .uri()
    .default("http://localhost:5173")
}).unknown(true);

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true
});

if (error) {
  throw new Error(
    `Environment configuration error: ${error.message}`
  );
}

module.exports = Object.freeze({
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGODB_URI,
  jwtSecret: value.JWT_SECRET,
  clientUrl: value.CLIENT_URL
});
