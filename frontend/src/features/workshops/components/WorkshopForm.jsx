import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function toDateTimeInput(date) {
  if (!date) {
    return "";
  }

  const localDate = new Date(date);
  const timezoneOffset = localDate.getTimezoneOffset() * 60000;
  return new Date(localDate.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function isFutureDate(value) {
  return value ? new Date(value).getTime() > new Date().getTime() : false;
}

function WorkshopForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Workshop",
  loading = false,
}) {
  const minimumSeats = Math.max(1, initialData?.bookedSeats || 0);
  const validationSchema = Yup.object({
    title: Yup.string()
      .trim()
      .min(3, "Use at least 3 characters.")
      .max(150, "Title cannot exceed 150 characters.")
      .required("Title is required."),
    description: Yup.string()
      .trim()
      .min(10, "Use at least 10 characters.")
      .max(2000, "Description cannot exceed 2000 characters.")
      .required("Description is required."),
    date: Yup.string()
      .required("Date is required.")
      .test("future-date", "Choose a date and time in the future.", (value) =>
        isFutureDate(value)
      ),
    totalSeats: Yup.number()
      .typeError("Enter a whole number of seats.")
      .integer("Seats must be a whole number.")
      .min(minimumSeats, `Seats cannot be less than ${minimumSeats}.`)
      .max(500, "A workshop can have at most 500 seats.")
      .required("Total seats are required."),
  });

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      date: toDateTimeInput(initialData?.date),
      totalSeats: String(initialData?.totalSeats || 1),
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);

      try {
        await onSubmit({
          title: values.title.trim(),
          description: values.description.trim(),
          totalSeats: Number(values.totalSeats),
          date: new Date(values.date).toISOString(),
        });

        if (!initialData) {
          helpers.resetForm({
            values: {
              title: "",
              description: "",
              date: "",
              totalSeats: "1",
            },
          });
        }
      } catch (error) {
        helpers.setStatus(
          error.response?.data?.message ||
            error.message ||
            "Could not save workshop."
        );
      }
    },
  });

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {submitLabel}
      </Typography>

      {formik.status && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.status}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Workshop title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fieldError("title"))}
          helperText={fieldError("title")}
          slotProps={{ htmlInput: { minLength: 3, maxLength: 150 } }}
          required
          fullWidth
        />

        <TextField
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fieldError("description"))}
          helperText={fieldError("description")}
          slotProps={{ htmlInput: { minLength: 10, maxLength: 2000 } }}
          multiline
          minRows={3}
          required
          fullWidth
        />

        <TextField
          label="Date and time"
          name="date"
          type="datetime-local"
          value={formik.values.date}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fieldError("date"))}
          helperText={fieldError("date")}
          slotProps={{ inputLabel: { shrink: true } }}
          required
          fullWidth
        />

        <TextField
          label="Total seats"
          name="totalSeats"
          type="number"
          value={formik.values.totalSeats}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fieldError("totalSeats"))}
          helperText={fieldError("totalSeats")}
          slotProps={{
            htmlInput: {
              min: minimumSeats,
              max: 500,
              step: 1,
            },
          }}
          required
        />

        <Stack direction="row" spacing={1}>
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={loading || formik.isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || formik.isSubmitting}
          >
            {loading || formik.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default WorkshopForm;
