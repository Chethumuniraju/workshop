
const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const workshopRoutes = require("./routes/workshop.routes");
const bookingRoutes = require("./routes/booking.routes");

const notFound = require("./middleware/not-found.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Allow requests from the Vite frontend
app.use(
  cors({
    origin: [
      ...new Set([
        env.clientUrl,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]),
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/bookings", bookingRoutes);

// Handle unknown routes
app.use(notFound);

// Centralized error handler must be last
app.use(errorHandler);

module.exports = app;
