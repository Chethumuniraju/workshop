const ApiError = require("../utils/ApiError");

// Validate request data using the supplied Joi schema.
function validate(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      convert: true,
      stripUnknown: true
    });

    // If validation fails, return a 400 Bad Request error.
    if (error) {
      const details = error.details.map((detail) => detail.message);

      return next(
        new ApiError(400, "Validation failed", details)
      );
    }

    // Replace request data with the validated and normalized value.
    req[property] = value;

    next();
  };
}

module.exports = validate;