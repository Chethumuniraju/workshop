
import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

function BookingCard({ booking, onCancel, cancelling = false }) {
  const workshop = booking.workshop || booking.workshopId || {};
  const title =
    workshop.title || booking.workshopTitle || "Workshop booking";

  const status = booking.status || "booked";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <div>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            {workshop.date && (
              <Typography color="text.secondary">
                {new Date(workshop.date).toLocaleString()}
              </Typography>
            )}

          </div>

          <Stack
            spacing={1}
            sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}
          >
            <Chip
              label={status}
              color={status === "cancelled" ? "default" : "success"}
            />

            {status !== "cancelled" && (
              <Button
                color="error"
                variant="outlined"
                disabled={cancelling}
                onClick={() => onCancel?.(booking)}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default BookingCard;
