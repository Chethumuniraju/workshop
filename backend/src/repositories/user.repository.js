const mongoose = require("mongoose");

class UserRepository {
  // Inject the User model through the constructor.
  constructor({ User }) {
    if (!User) {
      throw new Error("User model is required");
    }

    this.User = User;
  }

  // Create a new user document.
  async create(userData) {
    return this.User.create(userData);
  }

  // Find a user by email.
  // Used during login to identify the account.
  // Include passwordHash because the schema hides it by default.
  async findByEmail(email) {
    return this.User.findOne({
      email: email.toLowerCase().trim()
    }).select("+passwordHash");
  }

  // Find a user by MongoDB document ID.
  // passwordHash remains excluded by default.
  async findById(userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return null;
    }

    return this.User.findById(userId);
  }
}

module.exports = UserRepository;