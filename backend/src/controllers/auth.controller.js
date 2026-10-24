const asyncHandler = require("../utils/asyncHandler");

class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  register = asyncHandler(async (req, res) => {
    const result = await this.authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  });

  me = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  });
}

module.exports = AuthController;