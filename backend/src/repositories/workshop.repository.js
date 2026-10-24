const mongoose = require("mongoose");

class WorkshopRepository {
  // Inject the Workshop model through the constructor.
  constructor({ Workshop }) {
    if (!Workshop) {
      throw new Error("Workshop model is required");
    }

    this.Workshop = Workshop;
  }

  // Create a new workshop.
  async create(workshopData, { session } = {}) {
    const options = session ? { session } : {};

    const [workshop] = await this.Workshop.create(
      [workshopData],
      options
    );

    return workshop;
  }

  // Find a workshop by its MongoDB document ID.
  async findById(workshopId, { session } = {}) {
    if (!mongoose.isValidObjectId(workshopId)) {
      return null;
    }

    let query = this.Workshop.findById(workshopId);

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  async updateById(workshopId, workshopData) {
    return this.Workshop.findOneAndUpdate(
      {
        _id: workshopId,
        $expr: { $lte: ["$bookedSeats", workshopData.totalSeats] }
      },
      { $set: workshopData },
      { new: true, runValidators: true }
    );
  }

  async deleteById(workshopId, { session } = {}) {
    let query = this.Workshop.findByIdAndDelete(workshopId);

    if (session) {
      query = query.session(session);
    }

    return query;
  }

  // Retrieve upcoming workshops with pagination.
  // Only workshops whose dates are in the future are returned.
  async findUpcoming({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [workshops, total] = await Promise.all([
      this.Workshop.find({
        date: { $gt: new Date() }
      })
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),

      this.Workshop.countDocuments({
        date: { $gt: new Date() }
      })
    ]);

    return {
      workshops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Reserve one seat only if the workshop has availability.
  // The atomic condition prevents the seat counter from
  // exceeding totalSeats under concurrent requests.
  async reserveSeat(workshopId, { session } = {}) {
    const options = { new: true };

    if (session) {
      options.session = session;
    }

    return this.Workshop.findOneAndUpdate(
      {
        _id: workshopId,
        date: { $gt: new Date() },
        $expr: {
          $lt: ["$bookedSeats", "$totalSeats"]
        }
      },
      {
        $inc: { bookedSeats: 1 }
      },
      options
    );
  }

  // Release one seat when a booking is cancelled.
  // Never allow bookedSeats to become negative.
  async releaseSeat(workshopId, { session } = {}) {
    const options = { new: true };

    if (session) {
      options.session = session;
    }

    return this.Workshop.findOneAndUpdate(
      {
        _id: workshopId,
        bookedSeats: { $gt: 0 }
      },
      {
        $inc: { bookedSeats: -1 }
      },
      options
    );
  }
}

module.exports = WorkshopRepository;