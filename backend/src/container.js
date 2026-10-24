
const User = require("./models/user.model");
const Workshop = require("./models/workshop.model");
const Booking = require("./models/booking.model");

const UserRepository = require("./repositories/user.repository");
const WorkshopRepository = require("./repositories/workshop.repository");
const BookingRepository = require("./repositories/booking.repository");

const AuthService = require("./services/auth.service");
const WorkshopService = require("./services/workshop.service");
const BookingService = require("./services/booking.service");

const AuthController = require("./controllers/auth.controller");
const WorkshopController = require("./controllers/workshop.controller");
const BookingController = require("./controllers/booking.controller");

// 1. Create repositories by injecting the models.
const userRepository = new UserRepository({ User });
const workshopRepository = new WorkshopRepository({ Workshop });
const bookingRepository = new BookingRepository({ Booking });

// 2. Create services by injecting their repositories.
const authService = new AuthService({ userRepository });

const workshopService = new WorkshopService({
  workshopRepository,
  bookingRepository
});

const bookingService = new BookingService({
  bookingRepository,
  workshopRepository
});

// 3. Create controllers by injecting their services.
const authController = new AuthController({ authService });

const workshopController = new WorkshopController({
  workshopService
});

const bookingController = new BookingController({
  bookingService
});

// 4. Export the ready-to-use controllers.
module.exports = {
  authController,
  workshopController,
  bookingController
};
