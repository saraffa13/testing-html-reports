import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Mukta, sans-serif",
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "contained" },
          style: {
            backgroundColor: "#ffffff",
            color: "#2A77D5",
            boxShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "row",
            fontSize: "16px",
            gap: "8px",
            "&:hover": {
              backgroundColor: "#f0f8ff",
            },
            "& .MuiSvgIcon-root": {
              color: "#2A77D5",
            },
          },
        },
      ],
    },
  },
});

export default theme;
