
const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: Date,
      required: true
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
      validate: {
        validator: Number.isInteger,
        message: "Total seats must be an integer"
      }
    },

    bookedSeats: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Booked seats must be an integer"
      }
    }
  },
  {
    timestamps: true
  }
);

workshopSchema.index({ date: 1 });

const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;
