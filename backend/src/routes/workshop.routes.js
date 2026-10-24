
const express = require("express");

const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

const {
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopIdParamsSchema
} = require("../validators/workshop.validator");
const { createBookingParamsSchema } = require("../validators/booking.validator");

const { workshopController, bookingController } = require("../container");

const router = express.Router();

// GET /api/workshops
// Any authenticated user can list upcoming workshops with pagination.
router.get(
  "/",
  authenticate,
  workshopController.getUpcoming
);

// POST /api/workshops/:workshopId/book
// User only: book a seat in a workshop.
router.post(
  "/:workshopId/book",
  authenticate,
  authorize("user"),
  validate(createBookingParamsSchema, "params"),
  bookingController.createForWorkshop
);

// POST /api/workshops
// Admin only: create a workshop.
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createWorkshopSchema),
  workshopController.create
);

// PATCH /api/workshops/:workshopId
// Admin only: update a workshop.
router.patch(
  "/:workshopId",
  authenticate,
  authorize("admin"),
  validate(workshopIdParamsSchema, "params"),
  validate(updateWorkshopSchema),
  workshopController.update
);

// DELETE /api/workshops/:workshopId
// Admin only: delete a workshop without booking history.
router.delete(
  "/:workshopId",
  authenticate,
  authorize("admin"),
  validate(workshopIdParamsSchema, "params"),
  workshopController.delete
);

module.exports = router;
