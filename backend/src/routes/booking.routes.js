
const express = require("express");

const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createBookingSchema,
  cancelBookingParamsSchema
} = require("../validators/booking.validator");

const { bookingController } = require("../container");

const router = express.Router();

// Booking features are only available to regular users.
router.use(authenticate);
router.use(authorize("user"));

// POST /api/bookings
// Book one seat in a workshop.
router.post(
  "/",
  validate(createBookingSchema),
  bookingController.create
);

// GET /api/bookings/mine
// Retrieve the logged-in user's bookings.
router.get(
  ["/me", "/mine"],
  bookingController.getMyBookings
);

// PATCH /api/bookings/:bookingId/cancel
// Cancel the logged-in user's booking.
router.route("/:bookingId/cancel")
  .post(
    validate(cancelBookingParamsSchema, "params"),
    bookingController.cancel
  )
  .patch(
    validate(cancelBookingParamsSchema, "params"),
    bookingController.cancel
  );

module.exports = router;
