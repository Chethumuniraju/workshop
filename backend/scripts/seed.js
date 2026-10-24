const bcrypt = require("bcryptjs");
const Joi = require("joi");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const env = require("../src/config/env");
const User = require("../src/models/user.model");
const Workshop = require("../src/models/workshop.model");
const { connectDatabase } = require("../src/config/database");

const seedEnvironmentSchema = Joi.object({
  SEED_ADMIN_EMAIL: Joi.string().email().required(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).max(128).required(),
  SEED_USER_ONE_EMAIL: Joi.string().email().required(),
  SEED_USER_ONE_PASSWORD: Joi.string().min(8).max(128).required(),
  SEED_USER_TWO_EMAIL: Joi.string().email().required(),
  SEED_USER_TWO_PASSWORD: Joi.string().min(8).max(128).required(),
}).unknown(true);

const workshops = [
  {
    title: "Introduction to Creative Coding",
    description: "Learn creative coding fundamentals and build an interactive project.",
    daysFromNow: 7,
  },
  {
    title: "Practical Web Development",
    description: "Build and deploy a small full-stack web application.",
    daysFromNow: 14,
  },
  {
    title: "Design Thinking Workshop",
    description: "Practice user-centered design through guided team exercises.",
    daysFromNow: 21,
  },
];

async function seedUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function seedWorkshop({ title, description, daysFromNow }) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(12, 0, 0, 0);

  await Workshop.findOneAndUpdate(
    { title },
    {
      $set: { title, description, date },
      $setOnInsert: { totalSeats: 30, bookedSeats: 0 },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function seed() {
  const { error, value } = seedEnvironmentSchema.validate(process.env, {
    abortEarly: false,
  });
  if (error) {
    throw new Error(
      `Seed configuration error: ${error.message} Add these values to backend/.env; see backend/.env.example.`
    );
  }

  const emails = [
    value.SEED_ADMIN_EMAIL,
    value.SEED_USER_ONE_EMAIL,
    value.SEED_USER_TWO_EMAIL,
  ].map((email) => email.toLowerCase().trim());
  if (new Set(emails).size !== emails.length) {
    throw new Error("Seed account email addresses must be unique.");
  }

  await connectDatabase();

  try {
    await seedUser({
      name: "Workshop Administrator",
      email: value.SEED_ADMIN_EMAIL,
      password: value.SEED_ADMIN_PASSWORD,
      role: "admin",
    });
    await seedUser({
      name: "Workshop User One",
      email: value.SEED_USER_ONE_EMAIL,
      password: value.SEED_USER_ONE_PASSWORD,
      role: "user",
    });
    await seedUser({
      name: "Workshop User Two",
      email: value.SEED_USER_TWO_EMAIL,
      password: value.SEED_USER_TWO_PASSWORD,
      role: "user",
    });

    for (const workshop of workshops) {
      await seedWorkshop(workshop);
    }

    console.log("Seeded one admin, two users, and three upcoming workshops.");
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
});
