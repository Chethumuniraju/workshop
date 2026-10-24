
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

class WorkshopService {
  constructor({ workshopRepository, bookingRepository }) {
    this.workshopRepository = workshopRepository;
    this.bookingRepository = bookingRepository;
  }

  assertAdmin(currentUser, action) {
    if (!currentUser || currentUser.role !== "admin") {
      throw new ApiError(403, `Only administrators can ${action} workshops`);
    }
  }

  validateWorkshopData(workshopData) {
    const workshopDate = new Date(workshopData.date);

    if (
      Number.isNaN(workshopDate.getTime()) ||
      workshopDate <= new Date()
    ) {
      throw new ApiError(
        400,
        "Workshop date must be in the future"
      );
    }

    return {
      title: workshopData.title,
      description: workshopData.description,
      date: workshopDate,
      totalSeats: workshopData.totalSeats
    };
  }

  async create(workshopData, currentUser) {
    this.assertAdmin(currentUser, "create");

    return this.workshopRepository.create({
      ...this.validateWorkshopData(workshopData),
      bookedSeats: 0
    });
  }

  async update(workshopId, workshopData, currentUser) {
    this.assertAdmin(currentUser, "update");

    const updatedWorkshop = await this.workshopRepository.updateById(
      workshopId,
      this.validateWorkshopData(workshopData)
    );

    if (updatedWorkshop) {
      return updatedWorkshop;
    }

    const workshop = await this.workshopRepository.findById(workshopId);
    if (!workshop) {
      throw new ApiError(404, "Workshop not found");
    }

    throw new ApiError(
      409,
      "Total seats cannot be less than the number of existing bookings"
    );
  }

  async delete(workshopId, currentUser) {
    this.assertAdmin(currentUser, "delete");

    const session = await mongoose.startSession();
    let deletedWorkshop;

    try {
      await session.withTransaction(async () => {
        const workshop = await this.workshopRepository.findById(
          workshopId,
          { session }
        );

        if (!workshop) {
          throw new ApiError(404, "Workshop not found");
        }

        if (
          await this.bookingRepository.existsForWorkshop(
            workshopId,
            { session }
          )
        ) {
          throw new ApiError(
            409,
            "This workshop has booking history and cannot be deleted"
          );
        }

        deletedWorkshop = await this.workshopRepository.deleteById(
          workshopId,
          { session }
        );
      });

      if (!deletedWorkshop) {
        throw new ApiError(404, "Workshop not found");
      }

      return deletedWorkshop;
    } finally {
      await session.endSession();
    }
  }

  async getUpcoming(query = {}) {
    // 1. Parse pagination values.
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    // 2. Reject invalid pagination values.
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new ApiError(
        400,
        "Page must be positive and limit must be between 1 and 100"
      );
    }

    // 3. Retrieve paginated future workshops.
    const result = await this.workshopRepository.findUpcoming({
      page,
      limit
    });

    // 4. Include seats remaining for the frontend.
    const workshops = result.workshops.map((workshop) => {
      const data = workshop.toObject();

      return {
        ...data,
        seatsLeft: Math.max(
          0,
          workshop.totalSeats - workshop.bookedSeats
        )
      };
    });

    return {
      workshops,
      pagination: result.pagination
    };
  }
}

module.exports = WorkshopService;
