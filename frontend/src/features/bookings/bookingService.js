
import api from "../../services/api";

const createBooking = async (workshopId) => {
  const response = await api.post(`/api/workshops/${workshopId}/book`);
  return response.data;
};

const getMyBookings = async () => {
  const response = await api.get("/api/bookings/me");
  return response.data;
};

const cancelBooking = async (bookingId) => {
  const response = await api.post(
    `/api/bookings/${bookingId}/cancel`
  );
  return response.data;
};

const bookingService = {
  createBooking,
  getMyBookings,
  cancelBooking,
};

export default bookingService;
