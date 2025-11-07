export const datagridStyle = {
  height: "100%",
  border: "none",
  minWidth: 300,
  "& .MuiDataGrid-main": {
    borderRadius: "12px",
    overflow: "hidden",
    mx: 2,
  },
  "& .MuiDataGrid-virtualScroller": {
    overflowY: "auto",
    overflowX: "auto",
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "10px",
      "&:hover": {
        background: "#a8a8a8",
      },
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#ffffff",
    borderBottom: "none",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6c757d",
    minHeight: "56px !important",
    maxHeight: "56px !important",
  },
  "& .MuiDataGrid-columnHeader": {
    mb: 1,
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-cell": {
    borderLeft: "1px solid #F0F0F0",
    borderRight: "1px solid #F0F0F0",
    fontSize: "16px",
    fontWeight: 500,
    color: "#212529",
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#ffffff",
    marginBottom: "12px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#f8f9fa",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-2px)",
    },
    "&.Mui-selected": {
      backgroundColor: "#e3f2fd",
      boxShadow: "0 4px 16px rgba(42, 119, 213, 0.2)",
      "&:hover": {
        backgroundColor: "#e3f2fd",
        boxShadow: "0 6px 20px rgba(42, 119, 213, 0.25)",
      },
    },
  },
  "& .MuiDataGrid-footerContainer": {
    display: "none",
  },
};
