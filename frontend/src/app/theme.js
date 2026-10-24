import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#146b5b",
      dark: "#0c4d42",
      light: "#e5f3ef",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e9a45b",
      dark: "#b87836",
      light: "#fff3e5",
      contrastText: "#172d2a",
    },
    background: {
      default: "#f5f7f6",
      paper: "#ffffff",
    },
    text: {
      primary: "#1b302d",
      secondary: "#62736f",
    },
    divider: "#e3eae7",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.045em" },
    h2: { fontWeight: 800, letterSpacing: "-0.04em" },
    h3: { fontWeight: 750, letterSpacing: "-0.035em" },
    h4: { fontWeight: 750, letterSpacing: "-0.03em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          color: "#1b302d",
          borderBottom: "1px solid #e3eae7",
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          minHeight: 42,
        },
        containedPrimary: {
          boxShadow: "0 6px 16px rgba(20, 107, 91, 0.18)",
          "&:hover": {
            boxShadow: "0 8px 20px rgba(20, 107, 91, 0.24)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e5ece9",
          borderRadius: 16,
          boxShadow: "0 8px 28px rgba(28, 58, 50, 0.055)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;
