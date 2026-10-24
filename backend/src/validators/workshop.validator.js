const Joi = require("joi");

// Validate the request body when creating a workshop.
const createWorkshopSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(150)
    .required(),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required(),

  date: Joi.date()
    .iso()
    .greater("now")
    .required(),

  totalSeats: Joi.number()
    .integer()
    .min(1)
    .max(500)
    .required()
});

const workshopIdParamsSchema = Joi.object({
  workshopId: Joi.string()
    .hex()
    .length(24)
    .required()
});

// Export the schemas for use in validation middleware.
module.exports = {
  createWorkshopSchema,
  updateWorkshopSchema: createWorkshopSchema,
  workshopIdParamsSchema
};