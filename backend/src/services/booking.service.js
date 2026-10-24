
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

class BookingService {
  constructor({ bookingRepository, workshopRepository }) {
    this.bookingRepository = bookingRepository;
    this.workshopRepository = workshopRepository;
  }

  // Book one seat in a workshop.
  async create(userId, workshopId) {
    const session = await mongoose.startSession();
    let booking;

    try {
      await session.withTransaction(async () => {
        // 1. Check whether the workshop exists.
        const workshop = await this.workshopRepository.findById(
          workshopId,
          { session }
        );

        if (!workshop) {
          throw new ApiError(404, "Workshop not found");
        }

        // 2. Do not allow bookings for past workshops.
        if (workshop.date <= new Date()) {
          throw new ApiError(400, "Cannot book a past workshop");
        }

        // 3. Prevent duplicate active bookings.
        const existingBooking =
          await this.bookingRepository.findActiveByUserAndWorkshop(
            userId,
            workshopId,
            { session }
          );

        if (existingBooking) {
          throw new ApiError(
            409,
            "You already have an active booking for this workshop"
          );
        }

        // 4. Atomically reserve a seat.
        // This succeeds only if a seat is still available.
        const updatedWorkshop =
          await this.workshopRepository.reserveSeat(
            workshopId,
            { session }
          );

        if (!updatedWorkshop) {
          throw new ApiError(
            409,
            "No seats available for this workshop"
          );
        }

        // 5. Create the booking in the same transaction.
        booking = await this.bookingRepository.create(
          {
            user: userId,
            workshop: workshopId,
            status: "booked"
          },
          { session }
        );
      });

      return booking;
    } catch (error) {
      // The unique index prevents duplicate active bookings
      // even when two requests arrive concurrently.
      if (error.code === 11000) {
        throw new ApiError(
          409,
          "You already have an active booking for this workshop"
        );
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Get all bookings belonging to the logged-in user.
  async getMyBookings(userId) {
    return this.bookingRepository.findByUser(userId);
  }

  // Cancel a booking and release its seat.
  async cancel(bookingId, userId) {
    const session = await mongoose.startSession();
    let cancelledBooking;

    try {
      await session.withTransaction(async () => {
        // 1. Find the requested booking.
        const booking = await this.bookingRepository.findById(
          bookingId,
          { session }
        );

        if (!booking) {
          throw new ApiError(404, "Booking not found");
        }

        // 2. Ensure the booking belongs to this user.
        if (booking.user.toString() !== userId.toString()) {
          throw new ApiError(
            403,
            "You cannot cancel another user's booking"
          );
        }

        // 3. Prevent repeated cancellation.
        if (booking.status !== "booked") {
          throw new ApiError(
            409,
            "This booking has already been cancelled"
          );
        }

        // 4. Mark the booking as cancelled.
        cancelledBooking = await this.bookingRepository.updateStatus(
          bookingId,
          "cancelled",
          { session }
        );

        if (!cancelledBooking) {
          throw new ApiError(404, "Booking not found");
        }

        // 5. Release exactly one seat.
        const updatedWorkshop =
          await this.workshopRepository.releaseSeat(
            booking.workshop,
            { session }
          );

        if (!updatedWorkshop) {
          throw new ApiError(
            500,
            "Unable to release the workshop seat"
          );
        }
      });

      return cancelledBooking;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = BookingService;
