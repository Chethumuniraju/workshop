const mongoose = require("mongoose");

// Define the structure of a booking document.
const bookingSchema = new mongoose.Schema(
  {
    // Reference the user who made the booking.
    // immutable: true prevents changing the user after creation.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true
    },

    // Reference the workshop being booked.
    // immutable: true prevents changing the workshop after creation.
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      immutable: true
    },

    // Track whether the booking is active or cancelled.
    // New bookings are active by default.
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
      required: true
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps.
    timestamps: true
  }
);

// Index 1: Find a user's bookings efficiently,
// ordered by creation date, newest first.
bookingSchema.index({ user: 1, createdAt: -1 });

// Index 2: Find bookings for a particular workshop
// filtered by their status.
bookingSchema.index({ workshop: 1, status: 1 });

// Index 3: Prevent duplicate active bookings.
//
// The combination of user and workshop must be unique
// among documents whose status is "booked".
//
// Cancelled bookings are excluded from this unique index,
// allowing a user to book the same workshop again.
// The cancelled booking history remains in the collection.
bookingSchema.index(
  { user: 1, workshop: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "booked"
    }
  }
);

// Create and export the Mongoose model.
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;