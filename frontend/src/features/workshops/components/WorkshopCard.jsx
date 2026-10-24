
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function WorkshopCard({
  workshop,
  onBook,
  isAdmin = false,
  isBooked = false,
  bookingInProgress = false,
  bookingDisabled = false,
  showManage = false,
  onEdit,
  onDelete,
}) {
  const date = workshop.date
    ? new Date(workshop.date).toLocaleString()
    : "Date to be announced";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between" }}
        >
          <Typography variant="h6" fontWeight={700}>
            {workshop.title}
          </Typography>
          {workshop.category && (
            <Chip label={workshop.category} size="small" />
          )}
        </Stack>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {workshop.description || "No description available."}
        </Typography>

        <Typography sx={{ mt: 2 }}>Date: {date}</Typography>

        {workshop.location && (
          <Typography>Location: {workshop.location}</Typography>
        )}

        {workshop.price != null && (
          <Typography sx={{ mt: 1 }} fontWeight={600}>
            Price: ₹{workshop.price}
          </Typography>
        )}

        {workshop.seatsLeft != null && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Available seats: {workshop.seatsLeft}
          </Typography>
        )}
      </CardContent>

      {(showManage || onBook || isAdmin) && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          {showManage ? (
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <Button fullWidth variant="outlined" onClick={() => onEdit?.(workshop)}>
                Edit
              </Button>
              <Button fullWidth variant="outlined" color="error" onClick={() => onDelete?.(workshop)}>
                Delete
              </Button>
            </Stack>
          ) : isAdmin ? (
            <Button
              fullWidth
              variant="outlined"
              component={RouterLink}
              to="/admin"
            >
              Manage Workshops
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              disabled={
                bookingDisabled ||
                isBooked ||
                bookingInProgress ||
                workshop.seatsLeft === 0
              }
              onClick={() => onBook?.(workshop)}
            >
              {isBooked
                ? "Booked"
                : bookingInProgress
                  ? "Booking..."
                  : workshop.seatsLeft === 0
                    ? "Full"
                    : "Book"}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}

export default WorkshopCard;
