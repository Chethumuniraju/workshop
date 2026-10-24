import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import WorkshopCard from "../components/WorkshopCard";
import WorkshopForm from "../components/WorkshopForm";
import workshopService from "../workshopService";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

async function fetchUpcomingWorkshops() {
  const firstPage = await workshopService.getUpcomingWorkshops({
    page: 1,
    limit: 100,
  });
  const totalPages = firstPage.pagination?.totalPages;
  if (
    !Array.isArray(firstPage.data) ||
    !Number.isInteger(totalPages) ||
    totalPages < 0
  ) {
    throw new Error("The workshop response did not include a list.");
  }

  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, totalPages - 1) },
      (_, index) =>
        workshopService.getUpcomingWorkshops({
          page: index + 2,
          limit: 100,
        })
    )
  );

  if (remainingPages.some((page) => !Array.isArray(page.data))) {
    throw new Error("The workshop response did not include a list.");
  }

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((page) => page.data),
  ];
}

function AdminDashboardPage() {
  const [workshops, setWorkshops] = useState([]);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadWorkshops = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setWorkshops(await fetchUpcomingWorkshops());
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load workshops."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchUpcomingWorkshops()
      .then((items) => {
        if (active) {
          setWorkshops(items);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || err.message || "Failed to load workshops."
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

  const handleSaveWorkshop = async (workshopData) => {
    setError("");
    setSuccess("");

    const response = editingWorkshop
      ? await workshopService.updateWorkshop(
          editingWorkshop._id || editingWorkshop.id,
          workshopData
        )
      : await workshopService.createWorkshop(workshopData);

    setSuccess(response.message);
    setEditingWorkshop(null);
    await loadWorkshops();
  };

  const handleDeleteWorkshop = async () => {
    if (!deletingWorkshop) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await workshopService.deleteWorkshop(
        deletingWorkshop._id || deletingWorkshop.id
      );
      setSuccess(response.message);
      setDeletingWorkshop(null);
      await loadWorkshops();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Could not delete workshop."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Admin Dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create, edit, and delete upcoming workshops.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <WorkshopForm
          key={editingWorkshop?._id || editingWorkshop?.id || "new"}
          initialData={editingWorkshop}
          onSubmit={handleSaveWorkshop}
          onCancel={editingWorkshop ? () => setEditingWorkshop(null) : undefined}
          submitLabel={editingWorkshop ? "Save Changes" : "Create Workshop"}
        />
      </Paper>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Upcoming Workshops
      </Typography>

      {loading ? (
        <LoadingSpinner message="Loading workshops..." />
      ) : workshops.length === 0 ? (
        <Alert severity="info">There are no upcoming workshops to manage.</Alert>
      ) : (
        <Grid container spacing={3}>
          {workshops.map((workshop) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={workshop._id || workshop.id}>
              <WorkshopCard
                workshop={workshop}
                showManage
                onEdit={setEditingWorkshop}
                onDelete={setDeletingWorkshop}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(deletingWorkshop)}
        title="Delete workshop?"
        message="This cannot be undone. Workshops with booking history cannot be deleted."
        onConfirm={handleDeleteWorkshop}
        onClose={() => !deleting && setDeletingWorkshop(null)}
        loading={deleting}
      />
    </Container>
  );
}

export default AdminDashboardPage;
