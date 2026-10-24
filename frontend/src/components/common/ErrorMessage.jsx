
import { Alert, Button, Stack } from "@mui/material";

function ErrorMessage({ message = "Something went wrong.", onRetry }) {
  return (
    <Stack spacing={2}>
      <Alert severity="error">{message}</Alert>
      {onRetry && (
        <Button onClick={onRetry} variant="outlined" sx={{ alignSelf: "flex-start" }}>
          Try Again
        </Button>
      )}
    </Stack>
  );
}

export default ErrorMessage;
