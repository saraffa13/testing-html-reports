import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import { AppBar, Autocomplete, Avatar, IconButton, Paper, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApi } from "../../apis/base";

interface SearchResult {
  id: string;
  type: "client" | "site" | "guard" | "area_officer";
  title: string;
  subtitle: string;
  description: string;
  score: number;
  metadata: any;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    limit: number;
    query: string;
  };
}

const drawerWidth = "7rem";

interface SdieNavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const sideNavItems: SdieNavItem[] = [
  { label: "Dashboard", icon: <GridViewOutlinedIcon />, path: "/dashboard" },
  { label: "Clients", icon: <HandshakeOutlinedIcon />, path: "/clients" },
  {
    label: "Guards",
    icon: <AdminPanelSettingsOutlinedIcon />,
    path: "/guards",
  },
  {
    label: "Officers",
    icon: <SupervisorAccountOutlinedIcon />,
    path: "/officers",
  },
  { label: "Settings", icon: <SettingsOutlinedIcon />, path: "/settings" },
];

export default function SideNav({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useApi;
  const [user, setUser] = useState<any>(localStorage.getItem("user"));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Retrieved user from localStorage:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    useCallback(
      (query: string) => {
        const timeoutId = setTimeout(async () => {
          if (query.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
          }

          try {
            setIsSearching(true);
            const response: SearchResponse = await get(`/duties/search?q=${encodeURIComponent(query)}&limit=10`);
            if (response.success) {
              setSearchResults(response.data.results);
            }
          } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        }, 300);

        return () => clearTimeout(timeoutId);
      },
      [get]
    ),
    [get]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(searchQuery);
    return cleanup;
  }, [searchQuery, debouncedSearch]);

  const handleSearchSelect = (result: SearchResult | null) => {
    if (!result) return;

    switch (result.type) {
      case "client":
        navigate(`/clients/${result.id}/performance/guards-defaults`);
        break;
      case "site":
        if (result.metadata.clientId) {
          navigate(`/clients/${result.metadata.clientId}/sites/${result.id}`);
        }
        break;
      case "guard":
        navigate(`/guards/${result.id}/performance`);
        break;
      case "area_officer":
        navigate(`/officers/${result.id}/performance`);
        break;
      default:
        break;
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        mb: 2,
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth})`,
          ml: drawerWidth,
          bgcolor: "transparent",
          boxShadow: 0,
        }}
      >
        <Toolbar>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.title)}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </Box>
            )}
            inputValue={searchQuery}
            onInputChange={(_event, newInputValue) => {
              setSearchQuery(newInputValue);
            }}
            onChange={(_event, value) => {
              if (typeof value === "object" && value !== null) {
                handleSearchSelect(value);
              }
            }}
            loading={isSearching}
            renderInput={(params) => (
              <Paper
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 400,
                  height: 40,
                  borderRadius: "0.2rem",
                  bgcolor: "#F0F0F0A3",
                  ml: "auto",
                  border: "1px solid #C2DBFA",
                  boxShadow: 0,
                }}
              >
                <IconButton type="button" sx={{ p: "10px", color: "#2A77D5" }} aria-label="search">
                  <SearchIcon />
                </IconButton>
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Type Name or ID of Client, Site, or Person to Search..."
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    sx: {
                      ml: 1,
                      flex: 1,
                      fontSize: "0.8rem",
                    },
                  }}
                />
              </Paper>
            )}
            sx={{ width: 400, ml: "auto" }}
          />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            height: "100%",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              position: "relative",
              height: "100%",
              bgcolor: "#F0F0F0A3",
              borderTopLeftRadius: "1rem",
              borderBottomLeftRadius: "1rem",
              border: 0,
              p: 2,
            },
          }}
          variant="permanent"
          anchor="left"
          open
        >
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar src={user.agencyImageUrl} />
            <Typography
              sx={{
                typography: {
                  fontSize: "0.8rem",
                  fontWeight: 600,
                },
              }}
            >
              {user.agencyName}
            </Typography>
          </div>
          <Divider
            sx={{
              my: 4,
              borderColor: "#FFFFFF",
            }}
          />
          <List>
            {sideNavItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 1,
                      bgcolor: isActive ? "white" : "transparent",
                      borderRadius: "0.5rem",
                      "&:hover": {
                        bgcolor: isActive ? "white" : "rgba(255, 255, 255, 0.3)",
                      },
                      transition: "background-color 0.3s",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        marginInline: "auto",
                        minWidth: "auto",
                        mb: 1,
                        color: isActive ? "#2A77D5" : "#A3A3A3",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          align: "center",
                          fontSize: "0.8rem",
                          color: isActive ? "#2A77D5" : "#A3A3A3",
                        },
                      }}
                      sx={{ margin: 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Divider
            sx={{
              my: 2,
              borderColor: "#FFFFFF",
            }}
          />
          <div className="text-[0.6rem] text-[#A3A3A3] flex flex-col items-center mt-auto text-center">
            <span>22/2/2025</span>
            <span>Version v1</span>
            <br />
            <span>© May 2025</span>
            <br />
            <span>ALAN SCOTT UPANDUP LIFE PRIVATE LIMITED</span>
          </div>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#F0F0F0A3",
          p: 1,
          pl: 0,
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          display: "flex",
          minHeight: "80vh",
          pt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
