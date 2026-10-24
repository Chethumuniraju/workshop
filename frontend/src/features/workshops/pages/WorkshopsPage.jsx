import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Grid,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import workshopService from "../workshopService";
import bookingService from "../../bookings/bookingService";
import WorkshopCard from "../components/WorkshopCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { useAppSelector } from "../../../app/hooks";

const PAGE_SIZE = 9;

async function fetchWorkshops(page) {
  const response = await workshopService.getUpcomingWorkshops({
    page,
    limit: PAGE_SIZE,
  });
  if (!Array.isArray(response.data) || !response.pagination) {
    throw new Error("The workshop response did not include a list and pagination.");
  }
  return response;
}

async function fetchMyBookings() {
  const response = await bookingService.getMyBookings();
  if (!Array.isArray(response.data)) {
    throw new Error("The booking response did not include a list.");
  }
  return response.data;
}

async function fetchPageData(page, userRole) {
  const response = await fetchWorkshops(page);
  let bookedWorkshopIds = new Set();
  let bookingStatusKnown = userRole !== "user";
  let bookingError = "";

  if (userRole === "user") {
    try {
      const bookings = await fetchMyBookings();
      bookedWorkshopIds = new Set(
        bookings
          .filter((booking) => booking.status === "booked")
          .map((booking) => {
            const workshop = booking.workshop || booking.workshopId;
            return String(workshop?._id || workshop?.id || workshop);
          })
      );
      bookingStatusKnown = true;
    } catch (error) {
      bookingError =
        error.response?.data?.message ||
        error.message ||
        "Could not check your existing bookings. Retry before booking.";
    }
  }

  return {
    workshops: response.data,
    pagination: response.pagination,
    bookedWorkshopIds,
    bookingStatusKnown,
    bookingError,
  };
}

function WorkshopsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [bookedWorkshopIds, setBookedWorkshopIds] = useState(() => new Set());
  const [bookingStatusKnown, setBookingStatusKnown] = useState(false);
  const [bookingInProgressId, setBookingInProgressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const bookingLock = useRef(false);

  const loadWorkshops = useCallback(async () => {
    setLoading(true);
    setError("");
    setBookingError("");
    setBookingStatusKnown(false);

    try {
      const data = await fetchPageData(page, userRole);
      setWorkshops(data.workshops);
      setPagination(data.pagination);
      setBookedWorkshopIds(data.bookedWorkshopIds);
      setBookingStatusKnown(data.bookingStatusKnown);
      setBookingError(data.bookingError);
    } catch (workshopLoadError) {
      setError(
        workshopLoadError.response?.data?.message ||
          workshopLoadError.message ||
          "Failed to load workshops."
      );
    } finally {
      setLoading(false);
    }
  }, [page, userRole]);

  useEffect(() => {
    let active = true;

    fetchPageData(page, userRole)
      .then((data) => {
        if (!active) {
          return;
        }
        setWorkshops(data.workshops);
        setPagination(data.pagination);
        setBookedWorkshopIds(data.bookedWorkshopIds);
        setBookingStatusKnown(data.bookingStatusKnown);
        setBookingError(data.bookingError);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || "Failed to load workshops.");
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
  }, [loadWorkshops, page, userRole]);

  const handleBook = async (workshop) => {
    if (bookingLock.current) {
      return;
    }

    setBookingError("");
    setBookingMessage("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/workshops" } } });
      return;
    }

    if (userRole !== "user" || !bookingStatusKnown) {
      setBookingError(
        userRole === "admin"
          ? "Administrators cannot book workshops."
          : "Could not verify your bookings. Retry loading before booking."
      );
      return;
    }

    const workshopId = String(workshop._id || workshop.id);
    if (bookedWorkshopIds.has(workshopId)) {
      return;
    }

    bookingLock.current = true;
    setBookingInProgressId(workshopId);

    try {
      await bookingService.createBooking(workshopId);
      setBookedWorkshopIds((current) => new Set(current).add(workshopId));
      setWorkshops((current) =>
        current.map((item) =>
          String(item._id || item.id) === workshopId
            ? { ...item, seatsLeft: Math.max(0, item.seatsLeft - 1) }
            : item
        )
      );
      setBookingMessage("Workshop booked successfully.");
    } catch (bookingRequestError) {
      setBookingError(
        bookingRequestError.response?.data?.message ||
          "Could not book this workshop."
      );
    } finally {
      bookingLock.current = false;
      setBookingInProgressId(null);
    }
  };

  const handlePageChange = (_event, nextPage) => {
    setPage(nextPage);
    setLoading(true);
    setBookingMessage("");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Upcoming Workshops
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Explore workshops and reserve your seat.
      </Typography>

      {bookingError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setLoading(true);
                loadWorkshops();
              }}
            >
              Retry
            </Button>
          }
        >
          {bookingError}
        </Alert>
      )}
      {bookingMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {bookingMessage}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Loading workshops..." />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={() => {
            setLoading(true);
            loadWorkshops();
          }}
        />
      ) : workshops.length === 0 ? (
        <Alert severity="info">No upcoming workshops are available.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {workshops.map((workshop) => {
              const workshopId = String(workshop._id || workshop.id);
              const isRegularUser = userRole === "user";

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshopId}>
                  <WorkshopCard
                    workshop={workshop}
                    onBook={
                      !isAuthenticated || isRegularUser ? handleBook : undefined
                    }
                    isAdmin={userRole === "admin"}
                    isBooked={bookedWorkshopIds.has(workshopId)}
                    bookingInProgress={bookingInProgressId === workshopId}
                    bookingDisabled={
                      isRegularUser &&
                      (!bookingStatusKnown || Boolean(bookingInProgressId))
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
          {pagination?.totalPages > 1 && (
            <Stack sx={{ alignItems: "center", mt: 4 }}>
              <Pagination
                color="primary"
                page={page}
                count={pagination.totalPages}
                onChange={handlePageChange}
                disabled={loading}
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  );
}

export default WorkshopsPage;
