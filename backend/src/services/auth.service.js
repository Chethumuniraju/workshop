
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

class AuthService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    const { name, email, password } = userData;

    // 1. Check whether the email is already registered.
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }

    // 2. Hash the password before storing it.
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Create a regular user.
    // Never allow public registration to assign the admin role.
    let user;

    try {
      user = await this.userRepository.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "user"
      });
    } catch (error) {
      // Handle concurrent registration with the same email.
      if (error.code === 11000) {
        throw new ApiError(409, "Email is already registered");
      }
      throw error;
    }

    // 4. Return safe user information only.
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // 1. Find the user, including the hidden password hash.
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // 2. Compare the submitted password with its hash.
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    // 3. Generate a signed JWT.
    const token = jwt.sign(
      { sub: user._id.toString() },
      env.jwtSecret,
      { expiresIn: "1h" }
    );

    // 4. Return the token and safe user information.
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = AuthService;
