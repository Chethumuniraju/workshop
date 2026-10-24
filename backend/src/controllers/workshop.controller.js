
const asyncHandler = require("../utils/asyncHandler");

class WorkshopController {
  constructor({ workshopService }) {
    this.workshopService = workshopService;
  }

  create = asyncHandler(async (req, res) => {
    const workshop = await this.workshopService.create(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Workshop created successfully",
      data: workshop
    });
  });

  update = asyncHandler(async (req, res) => {
    const workshop = await this.workshopService.update(
      req.params.workshopId,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Workshop updated successfully",
      data: workshop
    });
  });

  delete = asyncHandler(async (req, res) => {
    const workshop = await this.workshopService.delete(
      req.params.workshopId,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Workshop deleted successfully",
      data: workshop
    });
  });

  getUpcoming = asyncHandler(async (req, res) => {
    const result = await this.workshopService.getUpcoming(req.query);

    res.status(200).json({
      success: true,
      message: "Upcoming workshops retrieved successfully",
      data: result.workshops,
      pagination: result.pagination
    });
  });
}

module.exports = WorkshopController;
