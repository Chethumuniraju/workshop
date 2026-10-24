const mongoose = require("mongoose");

class BookingRepository {
  // Inject the Booking model through the constructor.
  // This is constructor-based dependency injection.
  constructor({ Booking }) {
    if (!Booking) {
      throw new Error("Booking model is required");
    }

    this.Booking = Booking;
  }

  // Create a new booking.
  // An optional session allows this operation to participate
  // in a MongoDB transaction.
  async create(bookingData, { session } = {}) {
    const options = session ? { session } : {};

    const [booking] = await this.Booking.create(
      [bookingData],
      options
    );

    return booking;
  }

  // Find a booking using its MongoDB document ID.
  async findById(bookingId, { session } = {}) {
    if (!mongoose.isValidObjectId(bookingId)) {
      return null;
    }

    let query = this.Booking.findById(bookingId);

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  // Find an active booking for a specific user and workshop.
  // Useful for checking whether the user has already booked it.
  async findActiveByUserAndWorkshop(
    userId,
    workshopId,
    { session } = {}
  ) {
    let query = this.Booking.findOne({
      user: userId,
      workshop: workshopId,
      status: "booked"
    });

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  // Retrieve all bookings belonging to a particular user,
  // with the newest bookings appearing first.
  // Populate workshop details for the frontend.
  async findByUser(userId, { session } = {}) {
    let query = this.Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("workshop");

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  async existsForWorkshop(workshopId, { session } = {}) {
    let query = this.Booking.exists({ workshop: workshopId });

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  // Update the status of a booking.
  // runValidators ensures the new status follows the schema.
  // The session supports transactional cancellation.
  async updateStatus(
    bookingId,
    status,
    { session } = {}
  ) {
    const options = {
      new: true,
      runValidators: true
    };

    if (session) {
      options.session = session;
    }

    return this.Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      options
    );
  }
}

module.exports = BookingRepository;