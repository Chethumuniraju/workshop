
const asyncHandler = require("../utils/asyncHandler");

class BookingController {
  constructor({ bookingService }) {
    this.bookingService = bookingService;
  }

  create = asyncHandler(async (req, res) => {
    const booking = await this.bookingService.create(
      req.user._id,
      req.body.workshopId
    );

    res.status(201).json({
      success: true,
      message: "Workshop booked successfully",
      data: booking
    });
  });

  createForWorkshop = asyncHandler(async (req, res) => {
    const booking = await this.bookingService.create(
      req.user._id,
      req.params.workshopId
    );

    res.status(201).json({
      success: true,
      message: "Workshop booked successfully",
      data: booking
    });
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await this.bookingService.getMyBookings(
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data: bookings
    });
  });

  cancel = asyncHandler(async (req, res) => {
    const booking = await this.bookingService.cancel(
      req.params.bookingId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });
  });
}

module.exports = BookingController;
