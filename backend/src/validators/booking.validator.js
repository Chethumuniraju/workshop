const Joi = require("joi");

// Validate the request body when booking a workshop.
const createBookingSchema = Joi.object({
  workshopId: Joi.string()
    .hex()
    .length(24)
    .required()
});

const createBookingParamsSchema = Joi.object({
  workshopId: Joi.string()
    .hex()
    .length(24)
    .required()
});

// Validate the booking ID supplied when cancelling a booking.
const cancelBookingParamsSchema = Joi.object({
  bookingId: Joi.string()
    .hex()
    .length(24)
    .required()
});

// Export schemas for use by validation middleware and routes.
module.exports = {
  createBookingSchema,
  createBookingParamsSchema,
  cancelBookingParamsSchema
};