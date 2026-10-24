
import api from "../../services/api";

const getUpcomingWorkshops = async (params = {}) => {
  const response = await api.get("/api/workshops", { params });
  return response.data;
};

const createWorkshop = async (workshopData) => {
  const response = await api.post("/api/workshops", workshopData);
  return response.data;
};

const updateWorkshop = async (workshopId, workshopData) => {
  const response = await api.patch(
    `/api/workshops/${workshopId}`,
    workshopData
  );
  return response.data;
};

const deleteWorkshop = async (workshopId) => {
  const response = await api.delete(`/api/workshops/${workshopId}`);
  return response.data;
};

const workshopService = {
  getUpcomingWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
};

export default workshopService;
