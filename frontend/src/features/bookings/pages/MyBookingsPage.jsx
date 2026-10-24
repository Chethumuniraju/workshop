
import { useCallback, useEffect, useState } from "react";
import { Alert, Container, Stack, Typography } from "@mui/material";
import bookingService from "../bookingService";
import BookingCard from "../components/BookingCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

async function fetchBookings() {
  const response = await bookingService.getMyBookings();
  if (!Array.isArray(response.data)) {
    throw new Error("The booking response did not include a list.");
  }
  return response.data;
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setBookings(await fetchBookings());
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchBookings()
      .then((items) => {
        if (active) {
          setBookings(items);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || err.message || "Failed to load bookings."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    setError("");

    try {
      await bookingService.cancelBooking(
        selectedBooking._id || selectedBooking.id
      );
      setSelectedBooking(null);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <LoadingSpinner message="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <Alert severity="info">You don't have any bookings yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id || booking.id}
              booking={booking}
              onCancel={setSelectedBooking}
              cancelling={
                cancelling &&
                (selectedBooking?._id || selectedBooking?.id) ===
                  (booking._id || booking.id)
              }
            />
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(selectedBooking)}
        title="Cancel booking?"
        message="Are you sure you want to cancel this workshop booking?"
        onConfirm={handleCancel}
        onClose={() => !cancelling && setSelectedBooking(null)}
        loading={cancelling}
      />
    </Container>
  );
}

export default MyBookingsPage;
